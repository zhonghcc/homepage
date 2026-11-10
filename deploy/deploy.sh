#!/usr/bin/env bash
# 本机执行：构建前端并上传到服务器，同时同步并重启代理容器
#   用法：deploy/deploy.sh [static|proxy|all]，默认 all
#   BUILD=remote deploy/deploy.sh static   在服务器上构建前端（本机没有可用的 Node 时使用）
# 依赖：~/.ssh/config 中已配置 Host zhonghcc-lh，指向部署服务器；也可用 DEPLOY_HOST 覆盖
set -euo pipefail

HOST="${DEPLOY_HOST:-zhonghcc-lh}"
SITE_DIR="/www/wwwroot/www.zhonghcc.com"
PROXY_DIR="/opt/apps/homepage"
TARGET="${1:-all}"

cd "$(dirname "$0")/.."

# 排除宝塔自己维护的文件：.user.ini 带不可删除属性，.well-known 用于证书续签
RSYNC_SITE_EXCLUDES=(--exclude '.user.ini' --exclude '.htaccess' --exclude '.well-known' --exclude '404.html')

deploy_static() {
  if [ "${BUILD:-local}" = "remote" ]; then
    # 在服务器上用临时 Node 容器构建，构建完容器即删除，服务器不需要安装 Node
    # npm 缓存放在命名卷 homepage-npm-cache 里，后续构建优先用缓存，不必每次重新下载
    echo ">> 上传源码并在 ${HOST} 上构建"
    ssh "${HOST}" "mkdir -p ${PROXY_DIR}/web-src"
    rsync -az --delete --exclude node_modules --exclude dist --exclude .git --exclude proxy \
      ./ "${HOST}:${PROXY_DIR}/web-src/"
    ssh "${HOST}" "cd ${PROXY_DIR}/web-src && docker rm -f homepage-build >/dev/null 2>&1; timeout 900 docker run --rm --name homepage-build \
      -v \"\$PWD\":/src -v homepage-npm-cache:/root/.npm -w /src \
      -e NODE_OPTIONS=--openssl-legacy-provider node:20-alpine \
      sh -c 'npm ci --prefer-offline --no-audit --no-fund --registry=https://mirrors.cloud.tencent.com/npm/ && npm run build' \
      && rsync -a --delete $(printf "%q " "${RSYNC_SITE_EXCLUDES[@]}") dist/ ${SITE_DIR}/"
  else
    echo ">> 本机构建前端"
    [ -d node_modules ] || npm ci
    NODE_OPTIONS=--openssl-legacy-provider npm run build
    echo ">> 上传静态文件到 ${HOST}:${SITE_DIR}"
    rsync -az --delete "${RSYNC_SITE_EXCLUDES[@]}" dist/ "${HOST}:${SITE_DIR}/"
  fi
  ssh "${HOST}" "chown -R www:www ${SITE_DIR} 2>/dev/null || true"
}

deploy_proxy() {
  echo ">> 同步代理到 ${HOST}:${PROXY_DIR}"
  ssh "${HOST}" "mkdir -p ${PROXY_DIR}"
  rsync -az --delete --exclude cache --exclude node_modules proxy "${HOST}:${PROXY_DIR}/"
  rsync -az docker-compose.yml "${HOST}:${PROXY_DIR}/"
  ssh "${HOST}" "cd ${PROXY_DIR} && docker compose up -d --build && sleep 3 && curl -fsS http://127.0.0.1:3000/api/health"
  echo
}

case "${TARGET}" in
  static) deploy_static ;;
  proxy)  deploy_proxy ;;
  all)    deploy_proxy; deploy_static ;;
  *) echo "用法：$0 [static|proxy|all]"; exit 1 ;;
esac
echo ">> 完成"
