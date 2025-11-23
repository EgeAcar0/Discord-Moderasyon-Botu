require('dotenv').config(); // .env dosyasını yükler

module.exports = {
  apps: [
    {
      name: "moderasyon botu",
      script: "./index.js",         // Ana bot dosyası
      watch: false,                 // Prod için watch kapalı, istersen true yapabilirsin
      env: {
        NODE_ENV: "development",
        TOKEN: process.env.TOKEN
      },
      env_production: {
        NODE_ENV: "production",
        TOKEN: process.env.TOKEN
      },
      // Log dosyaları (isteğe bağlı)
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    }
  ]
};
