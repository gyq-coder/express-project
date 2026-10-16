#!/usr/bin/env node
import "dotenv/config";
import e from "http-errors";
import t from "express";
import n from "path";
import r from "cookie-parser";
import i from "pino-http";
import a from "pino";
import o from "compression";
import s from "helmet";
import c from "cors";
import { rateLimit as l } from "express-rate-limit";
import u from "swagger-ui-express";
import d from "swagger-jsdoc";
import f from "express-zod-safe";
import { z as p } from "zod";
import { createClient as m } from "redis";
import h from "bcryptjs";
import g from "jsonwebtoken";
import _ from "http";
const v = t.Router();
v.get(`/`, async function (e, t, n) {
  (console.log(`获取请求头信息:`, e.get(`User-Agent`)),
    console.log(`获取Authorization头信息:`, e.get(`Authorization`)),
    t.json({ message: `欢迎来到首页` }));
});
const y = m({ socket: { host: `localhost`, port: 6379 }, username: `default`, password: `admin` });
(y.on(`error`, (e) => console.error(`Redis Error:`, e)), y.connect().catch(console.error));
async function b(e) {
  return h.hash(e, 10);
}
async function x(e, t) {
  return h.compare(e, t);
}
const S = t.Router();
S.post(`/`, f({ body: { username: p.string(), password: p.string() } }), async function (e, t, n) {
  let { username: r, password: i } = e.body,
    a = await y.get(`user:${r}`);
  if (!a) return t.status(500).json({ message: `用户名或密码错误` });
  let o = JSON.parse(a);
  if (!(await x(i, o.password))) return t.status(500).json({ message: `用户名或密码错误` });
  let s = g.sign({ id: o.id, username: o.username }, process.env.JWT_SECRET || `your_secret_key`, {
    expiresIn: `1h`,
  });
  t.json({ user: { id: o.id, username: o.username }, token: s });
});
const C = t.Router();
C.post(
  `/add`,
  f({ body: { username: p.string().min(2).max(100), password: p.string().min(6).max(100) } }),
  async function (e, t, n) {
    let { username: r, password: i } = e.body;
    if (await y.get(`user:${r}`)) return t.status(500).json({ message: `用户已存在` });
    let a = await b(i),
      o = { id: Date.now().toString(), username: r, password: a };
    (await y.set(`user:${r}`, JSON.stringify(o)), t.status(200).json({ user: o }));
  },
);
const w = t();
(w.use(s()),
  w.use(c()),
  w.use(o()),
  w.use(t.json()),
  w.use(t.urlencoded({ extended: !1 })),
  w.use(r()),
  w.use(t.static(n.join(import.meta.dirname, `public`))),
  w.use(l({ windowMs: 9e5, limit: 100, standardHeaders: !0, legacyHeaders: !1, ipv6Subnet: 56 })),
  w.use(
    `/docs`,
    u.serve,
    u.setup(
      d({
        definition: {
          openapi: `3.0.0`,
          info: { title: `你的 API`, version: `1.0.0`, description: `API 描述` },
        },
        apis: [`src/**/**/controller.ts`],
      }),
    ),
  ),
  w.use(
    i({
      logger: a({
        level: process.env.LOG_LEVEL || `info`,
        transport:
          process.env.NODE_ENV === `production`
            ? void 0
            : {
                target: `pino-pretty`,
                options: { colorize: !0, translateTime: `SYS:standard`, ignore: `pid,hostname` },
              },
      }),
      customLogLevel(e, t, n) {
        return n || t.statusCode >= 500 ? `error` : t.statusCode >= 400 ? `warn` : `info`;
      },
      customSuccessMessage(e, t) {
        return `${e.method} ${e.url} completed`;
      },
      customErrorMessage(e, t, n) {
        return `${e.method} ${e.url} failed: ${n.message}`;
      },
      serializers: {
        req(e) {
          return { method: e.method, url: e.url, id: e.id };
        },
        res(e) {
          return { statusCode: e.statusCode };
        },
      },
      autoLogging: {
        ignore: (e) =>
          e.url === `/health` || e.url === `/favicon.ico` || e.url.startsWith(`/.well-known/`),
      },
    }),
  ),
  w.use(`/`, v),
  w.use(`/login`, S),
  w.use(`/user`, C),
  w.use(function (t, n, r) {
    r(e(404));
  }),
  w.use(function (e, t, n, r) {
    n.status(e.status || 500).send(e.message || `Internal Server Error`);
  }));
const T = D(process.env.PORT || `3000`);
w.set(`port`, T);
const E = _.createServer(w);
(E.listen(T), E.on(`error`, O), E.on(`listening`, k));
function D(e) {
  let t = parseInt(e, 10);
  return isNaN(t) ? e : t >= 0 && t;
}
function O(e) {
  if (e.syscall !== `listen`) throw e;
  let t = typeof T == `string` ? `Pipe ` + T : `Port ` + T;
  switch (e.code) {
    case `EACCES`:
      (console.error(t + ` requires elevated privileges`), process.exit(1));
      break;
    case `EADDRINUSE`:
      (console.error(t + ` is already in use`), process.exit(1));
      break;
    default:
      throw e;
  }
}
function k() {
  let e = E.address(),
    t = typeof e == `string` ? `pipe ` + e : `port ` + e?.port;
  console.log(`Listening on ` + t);
}
export {};
