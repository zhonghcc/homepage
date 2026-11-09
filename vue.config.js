module.exports = {
  // 本地开发时把 /api 转给本机的 proxy 服务（cd proxy && npm start）
  devServer: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
}
