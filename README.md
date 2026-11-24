# homepage

Zhonghcc 的个人主页，访问地址：[zhonghcc.com](https://zhonghcc.com)

一页式的起始页：每日 Bing 壁纸做背景，中间是头像、一句随机古诗词，以及博客、PicUp、跑者拾穗、Kid Game 等站点入口。

## 页面上有什么

- **每日壁纸**：取自 Bing 每日美图，右下角注明图片出处
- **每日诗词**：来自 [今日诗词](https://www.jinrishici.com/)，接口不可用时从已缓存的诗句里随机选一句
- **标签页短句**：浏览器标签页标题是「Zhonghcc · 一句话」，每次打开随机换一句，内容在 `src/taglines.js` 里维护
- **入场动画**：各元素依次渐入；系统开启「减少动态效果」时直接显示

## 结构

```
浏览器 ──https──> Nginx
                   ├─ /       静态文件（Vue 构建产物）
                   └─ /api/   → 127.0.0.1:3000  proxy 容器（Node）
                                               └─ 定时拉取壁纸与诗词，落盘缓存
```

前端只请求同域名下的 `/api`，不直连任何第三方接口，所以不存在跨域问题；第三方服务出故障时，页面照样能用缓存内容打开。

```
src/
  App.vue          页面主体
  taglines.js      标签页随机短句
  assets/          头像
public/            index.html 与网站图标
proxy/             壁纸与诗词代理（零依赖 Node 服务）
docker-compose.yml 代理容器的编排
```

## 壁纸与诗词代理

`proxy/server.js` 不依赖任何第三方包，需要 Node 18 及以上版本。

**接口**

| 路径 | 说明 |
|---|---|
| `/api/wallpaper` | 当日壁纸信息：Bing 原图地址、本机缓存地址、图片出处、日期 |
| `/api/wallpaper/image` | 本机缓存的壁纸图片，Bing 图片加载失败时使用 |
| `/api/poem` | 一句诗词 |
| `/api/health` | 健康检查 |

**稳定性的做法**

- 壁纸按 Bing 国内站、Bing 国际站、biturl 的顺序尝试，前一个失败再换下一个
- 每 30 分钟刷新一次并写入磁盘，用户请求只读缓存；上游全部失败时继续使用上一次的结果
- 上游地址写死在代码里，不提供任意网址转发，避免被当成公开代理

**环境变量**

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `3000` | 监听端口 |
| `CACHE_DIR` | `./cache` | 缓存目录 |
| `WALLPAPER_RESOLUTION` | `1920x1080` | 壁纸分辨率 |
| `REFRESH_INTERVAL_MS` | `1800000` | 刷新间隔，单位毫秒 |
| `UPSTREAM_TIMEOUT_MS` | `5000` | 上游请求超时，单位毫秒 |

## 本地开发

```bash
# 终端一：启动代理
cd proxy && npm start

# 终端二：启动前端，/api 会自动转给本机 3000 端口
npm install
NODE_OPTIONS=--openssl-legacy-provider npm run serve
```

项目基于 vue-cli 4（webpack 4），在 Node 17 及以上版本运行时需要加 `NODE_OPTIONS=--openssl-legacy-provider`。

## 部署

分两部分：

- **静态文件**：`npm run build` 产出的 `dist/` 交给 Nginx 等 Web 服务器托管。`index.html` 建议不缓存，js/css 文件名带哈希，可以长期缓存
- **代理**：`docker compose up -d --build` 启动 proxy 容器，只监听本机 `127.0.0.1:3000`，由 Web 服务器把 `/api/` 反代过去

## 致谢

- 壁纸：[Bing 每日美图](https://www.bing.com)，备用源 [bing.biturl.top](https://bing.biturl.top)
- 诗词：[今日诗词](https://www.jinrishici.com/)
- 图标：[vue-awesome](https://github.com/Justineo/vue-awesome)（Font Awesome）
