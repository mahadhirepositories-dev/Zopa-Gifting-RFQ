module.exports = {
  apps: [
    {
      name: process.env.APP_NAME || "zopa-gifting",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      merge_logs: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: "10s",
      watch: false,
    },
  ],
};
