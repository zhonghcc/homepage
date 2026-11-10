module.exports = {
  // 生产构建不生成 .map 源码映射文件，避免线上可直接查看源码
  productionSourceMap: false,
  // 本地开发时把 /api 转给本机的 proxy 服务（cd proxy && npm start）
  devServer: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
}
