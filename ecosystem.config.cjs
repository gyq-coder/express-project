module.exports = {
  apps: [
    {
      // 基础配置
      name: "express-project", // 应用名称，用于pm2命令中标识
      script: "dist/server.js", // 应用的入口文件
      cwd: ".", // 应用运行的目录，建议使用绝对路径

      // 性能与集群配置
      exec_mode: "cluster", // 开启集群模式，这是负载均衡的前提
      instances: "max", // 根据CPU核心数启动最多进程，也可指定具体数字
      max_memory_restart: "1G", // 当进程内存超过1G时自动重启，防止内存泄漏拖垮服务

      // 日志管理
      error_file: "./logs/error.log", // 错误日志存放位置
      out_file: "./logs/access.log", // 标准输出日志位置
      log_date_format: "YYYY-MM-DD HH:mm:ss", // 给日志加上时间戳
      merge_logs: true, // 多进程时，将日志合并到一个文件中，方便查看

      // 稳定性保障
      autorestart: true, // 进程意外退出时自动重启
      watch: false, // 生产环境务必关闭文件监听，避免意外重启
    },
  ],
};
