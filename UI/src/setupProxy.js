const { createProxyMiddleware } = require("http-proxy-middleware");

const ppApiProxy = createProxyMiddleware({
  target: process.env.REACT_APP_API_URL || "http://localhost:8080",
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    "^/api": "/api",
  },
  logLevel: "debug",
  onProxyReq: function onProxyReq(proxyReq, req, res) {},
});

module.exports = function (app) {
  app.use("/api", ppApiProxy);
};
