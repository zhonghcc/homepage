'use strict';

// 壁纸与诗词代理：零依赖，Node 18+（使用内置 fetch）
// 设计要点：
//   1. 上游地址写死在代码里（白名单），不提供通用 ?url= 转发，避免被当作公开代理
//   2. 定时刷新并落盘缓存，用户请求只读缓存，上游故障不影响页面
//   3. 多源按顺序回退，全部失败时继续使用上一次成功的结果

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const CACHE_DIR = process.env.CACHE_DIR || path.join(__dirname, 'cache');
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS || 5000);
const REFRESH_INTERVAL_MS = Number(process.env.REFRESH_INTERVAL_MS || 30 * 60 * 1000);
const RESOLUTION = process.env.WALLPAPER_RESOLUTION || '1920x1080';

const META_FILE = path.join(CACHE_DIR, 'wallpaper.json');
const IMAGE_FILE = path.join(CACHE_DIR, 'wallpaper.jpg');
const POEM_FILE = path.join(CACHE_DIR, 'poems.json');

const log = (...args) => console.log(new Date().toISOString(), ...args);

async function fetchWithTimeout(url, asType = 'json') {
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    headers: { 'User-Agent': 'Mozilla/5.0 (homepage-proxy)' },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${url}`);
  if (asType === 'json') return resp.json();
  return Buffer.from(await resp.arrayBuffer());
}

// ---------- 壁纸 ----------

// 上游白名单，按顺序尝试；每个源都要返回 { url, copyright, date }
const WALLPAPER_SOURCES = [
  {
    name: 'bing-cn',
    async load() {
      const data = await fetchWithTimeout(
        'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
      );
      const img = data && data.images && data.images[0];
      if (!img || !img.urlbase) throw new Error('bing-cn: 返回结构异常');
      return {
        url: `https://cn.bing.com${img.urlbase}_${RESOLUTION}.jpg`,
        copyright: img.copyright || '',
        date: img.enddate || '',
      };
    },
  },
  {
    name: 'bing-global',
    async load() {
      const data = await fetchWithTimeout(
        'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
      );
      const img = data && data.images && data.images[0];
      if (!img || !img.urlbase) throw new Error('bing-global: 返回结构异常');
      return {
        url: `https://www.bing.com${img.urlbase}_${RESOLUTION}.jpg`,
        copyright: img.copyright || '',
        date: img.enddate || '',
      };
    },
  },
  {
    name: 'biturl',
    async load() {
      const width = RESOLUTION.split('x')[0];
      const data = await fetchWithTimeout(
        `https://bing.biturl.top/?resolution=${width}&format=json&index=0&mkt=zh-CN`
      );
      if (!data || !data.url) throw new Error('biturl: 返回结构异常');
      return { url: data.url, copyright: data.copyright || '', date: data.end_date || '' };
    },
  },
];

let wallpaper = null; // { url, copyright, date, source, updatedAt }
let refreshing = false;

async function writeAtomic(file, content) {
  const tmp = `${file}.tmp`;
  await fsp.writeFile(tmp, content);
  await fsp.rename(tmp, file);
}

async function refreshWallpaper() {
  if (refreshing) return;
  refreshing = true;
  try {
    for (const source of WALLPAPER_SOURCES) {
      try {
        const meta = await source.load();
        // 同一天且本地图片已存在，就不重复下载
        if (wallpaper && wallpaper.url === meta.url && fs.existsSync(IMAGE_FILE)) {
          wallpaper.updatedAt = new Date().toISOString();
          return;
        }
        const image = await fetchWithTimeout(meta.url, 'buffer');
        if (image.length < 10 * 1024) throw new Error(`${source.name}: 图片过小，疑似错误页`);
        await writeAtomic(IMAGE_FILE, image);
        wallpaper = { ...meta, source: source.name, updatedAt: new Date().toISOString() };
        await writeAtomic(META_FILE, JSON.stringify(wallpaper, null, 2));
        log(`壁纸已更新 source=${source.name} date=${meta.date}`);
        return;
      } catch (err) {
        log(`壁纸源 ${source.name} 失败：${err.message}`);
      }
    }
    log('所有壁纸源均失败，继续使用缓存');
  } finally {
    refreshing = false;
  }
}

// ---------- 诗词 ----------

const FALLBACK_POEMS = [
  { content: '行到水穷处，坐看云起时。', author: '王维', origin: '终南别业' },
  { content: '海上生明月，天涯共此时。', author: '张九龄', origin: '望月怀远' },
  { content: '长风破浪会有时，直挂云帆济沧海。', author: '李白', origin: '行路难' },
  { content: '山重水复疑无路，柳暗花明又一村。', author: '陆游', origin: '游山西村' },
  { content: '会当凌绝顶，一览众山小。', author: '杜甫', origin: '望岳' },
];
const POEM_POOL_SIZE = 100;
let poemPool = [];

async function fetchPoem() {
  const data = await fetchWithTimeout('https://v1.jinrishici.com/all.json');
  if (!data || !data.content) throw new Error('jinrishici: 返回结构异常');
  const poem = { content: data.content, author: data.author || '', origin: data.origin || '' };
  if (!poemPool.some((p) => p.content === poem.content)) {
    poemPool.push(poem);
    if (poemPool.length > POEM_POOL_SIZE) poemPool.shift();
    writeAtomic(POEM_FILE, JSON.stringify(poemPool)).catch(() => {});
  }
  return poem;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ---------- HTTP ----------

function sendJson(res, status, body, cacheSeconds = 0) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'method not allowed' });
  }

  try {
    if (pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, wallpaper: wallpaper ? wallpaper.date : null });
    }

    if (pathname === '/api/wallpaper') {
      if (!wallpaper) return sendJson(res, 503, { error: 'wallpaper not ready' });
      return sendJson(
        res,
        200,
        {
          url: wallpaper.url, // Bing CDN 原图，节省本机带宽
          fallback: '/api/wallpaper/image', // 本机缓存副本，CDN 不可用时使用
          copyright: wallpaper.copyright,
          date: wallpaper.date,
        },
        600
      );
    }

    if (pathname === '/api/wallpaper/image') {
      if (!fs.existsSync(IMAGE_FILE)) return sendJson(res, 404, { error: 'no cached image' });
      const stat = await fsp.stat(IMAGE_FILE);
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=3600',
        'Last-Modified': stat.mtime.toUTCString(),
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(IMAGE_FILE).pipe(res);
    }

    if (pathname === '/api/poem') {
      let poem;
      try {
        poem = await fetchPoem();
      } catch (err) {
        log(`诗词源失败：${err.message}`);
        poem = randomFrom(poemPool.length ? poemPool : FALLBACK_POEMS);
      }
      return sendJson(res, 200, poem);
    }

    return sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    log('请求处理异常', err);
    if (!res.headersSent) sendJson(res, 500, { error: 'internal error' });
    else res.end();
  }
});

async function loadCache() {
  await fsp.mkdir(CACHE_DIR, { recursive: true });
  try {
    wallpaper = JSON.parse(await fsp.readFile(META_FILE, 'utf8'));
    log(`读取壁纸缓存 date=${wallpaper.date}`);
  } catch {
    wallpaper = null;
  }
  try {
    poemPool = JSON.parse(await fsp.readFile(POEM_FILE, 'utf8'));
  } catch {
    poemPool = [];
  }
}

(async () => {
  await loadCache();
  server.listen(PORT, () => log(`homepage-proxy 监听 :${PORT}`));
  refreshWallpaper();
  setInterval(refreshWallpaper, REFRESH_INTERVAL_MS).unref();
})();

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
