
const withPWA = require("next-pwa")({
    dest: "public", // Service Worker を出力する場所
    register: true, // 自動登録
    skipWaiting: true, // 新しいSWがすぐ反映される
    disable: false
  });

  module.exports = withPWA({
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
  });


