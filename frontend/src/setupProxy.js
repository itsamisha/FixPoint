const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    })
  );

  // Proxy WebSocket connections to backend
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      secure: false,
    })
  );

  // Proxy Chat WebSocket connections to backend
  app.use(
    '/ws-chat',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      secure: false,
    })
  );

  // Proxy uploads (images) to backend
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    })
  );
};
