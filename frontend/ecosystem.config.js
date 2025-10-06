module.exports = {
  apps: [{
    name: 'next-frontend',
    script: 'npm',
    args: 'run dev',
    cwd: '/home/user/webapp/frontend',
    env: {
      NODE_ENV: 'development'
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}