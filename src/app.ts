import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import pino from "pino";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import homeController from "./modules/home/controller";
import loginController from "./modules/login/controller";
import userController from "./modules/user/controller";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, "public")));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 时间窗口：15 分钟
    limit: 100, // 每个 IP 在窗口内最多 100 次请求
    standardHeaders: true, // 返回标准的 RateLimit-* 响应头
    legacyHeaders: false, // 禁用旧的 X-RateLimit-* 响应头
    ipv6Subnet: 56, // IPv6 子网掩码位数（推荐值）
  }),
); // 将速率限制器应用到所有请求

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerJSDoc({
      definition: {
        openapi: "3.0.0",
        info: {
          title: "你的 API",
          version: "1.0.0",
          description: "API 描述",
        },
      },
      apis: ["src/**/**/controller.ts"], // 扫描路由文件中的注释
    }),
  ),
);

// 请求日志中间件
app.use(
  pinoHttp({
    logger: pino({
      level: process.env.LOG_LEVEL || "info",
      // 开发环境用 pino-pretty 美化；生产环境输出原始 JSON
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            },
    }),
    // 自定义日志级别：5xx 用 error，4xx 用 warn，其余 info
    customLogLevel(req, res, err) {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    // 精简输出，只保留关键字段
    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} completed`;
    },
    customErrorMessage(req, res, err) {
      return `${req.method} ${req.url} failed: ${err.message}`;
    },
    // 只记录需要的 header
    serializers: {
      req(req) {
        return { method: req.method, url: req.url, id: req.id };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
    // 健康检查等噪音路径不记录
    autoLogging: {
      ignore: (req) =>
        req.url === "/health" || req.url === "/favicon.ico" || req.url.startsWith("/.well-known/"),
    },
  }),
);

// 设置路由
app.use("/", homeController);
app.use("/login", loginController);
app.use("/user", userController);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
interface ErrorWithStatus extends Error {
  status?: number;
}
app.use(function (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) {
  // send the error
  res.status(err.status || 500).send(err.message || "Internal Server Error");
});

export default app;
