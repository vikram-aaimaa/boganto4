module.exports = {
  apps: [{
    name: 'boganto-backend',
    script: 'php',
    args: ['-S', 'localhost:8000', 'server.php'],
    cwd: './backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    }
  }]
}
