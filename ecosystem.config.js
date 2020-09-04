module.exports = {
    apps : [{
        name: "chatcola-server-http",
        script: 'build/drivers/web/index.js',
        env: {
          NODE_ENV: "production"
        }
      }
    ],
  };
  