// next.config.js
const withPWA = require("next-pwa")({
    dest: "public", // Service Worker を出力する場所
    register: true, // 自動登録
    skipWaiting: true, // 新しいSWがすぐ反映される
    disable: process.env.NODE_ENV === "development", // dev環境では無効
  });

  module.exports = withPWA({
    reactStrictMode: true,
  });


