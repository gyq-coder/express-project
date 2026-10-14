import { createClient } from "redis";

const client = createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
  username: "default",
  password: "admin",
});

// 必须监听 error，否则连接出错可能导致进程崩溃
client.on("error", (err) => console.error("Redis Error:", err));

// v4+ 需要显式连接
client.connect().catch(console.error);

export default client;
