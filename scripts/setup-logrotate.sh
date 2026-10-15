#!/bin/bash

# 配置 pm2-logrotate 模块
setup_logrotate() {
    # 1. 安装模块（如果还没安装）
    if ! pm2 list | grep -q "pm2-logrotate"; then
        echo "Installing pm2-logrotate..."
        pm2 install pm2-logrotate
    fi
    
    # 2. 设置定时任务：每7天0点切割
    pm2 set pm2-logrotate:rotateInterval '0 0 */7 * *'
    
    # 3. 设置文件大小限制（超过2G也切割，防止单文件过大）
    pm2 set pm2-logrotate:max_size '2G'
    
    # 4. 保留最近4个日志文件（对应约28天到35天的数据）
    pm2 set pm2-logrotate:retain 4
    
    # 5. 压缩旧日志
    pm2 set pm2-logrotate:compress true
    
    # 6. 启动时也检查并切割（可选）
    pm2 set pm2-logrotate:rotateOnStart true
    
    echo "✅ PM2 logrotate configured: logs will be rotated every 7 days at 00:00"
}

# 显示当前配置
show_config() {
    echo ""
    echo "Current pm2-logrotate configuration:"
    pm2 conf | grep pm2-logrotate
}

# 执行配置
setup_logrotate
show_config