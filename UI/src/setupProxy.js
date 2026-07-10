const { createProxyMiddleware } = require("http-proxy-middleware");

const ppApiProxy = createProxyMiddleware({
  target: "http://localhost:3000",
  // target: "http://127.0.0.1:3000/",
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    "^/api": "/api",
  },
  loglevel: "debug",
  onProxyReq: function onProxyReq(proxyReq, req, res) {},
});

module.exports = function (app) {
  app.use("/api", ppApiProxy);
};
