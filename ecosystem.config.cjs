module.exports = {
  apps: [
    {
      name: 'api-server',
      script: 'node',
      args: '--enable-source-maps ./scripts/pm2-start.mjs',
      cwd: __dirname,
      env: {
        PORT: process.env.PORT || 3000,
        NODE_ENV: 'development',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      stop_exit_codes: [1],
    },
  ],
};
