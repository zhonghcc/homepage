# 第一阶段：构建 Vue 静态文件
# vue-cli 4 基于 webpack 4，Node 17+ 需要开启旧版 OpenSSL 才能构建
FROM node:20-alpine AS build
WORKDIR /src
ENV NODE_OPTIONS=--openssl-legacy-provider
COPY package.json package-lock.json ./
RUN npm ci --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

# 第二阶段：nginx 托管静态文件，并把 /api 转给代理容器
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
