module.exports = {
    apps : [{
        name: "chatcola-server",
        script: 'build/index.js',
        env: {
          NODE_ENV: "production"
        }
      }
    ],
  };
  