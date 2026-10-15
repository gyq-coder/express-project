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
import g from "http";
const _ = t.Router();
_.get(`/`, function (e, t, n) {
  (console.log(e.cookies), t.send(`root`));
});
const v = m({ socket: { host: `localhost`, port: 6379 }, username: `default`, password: `admin` });
(v.on(`error`, (e) => console.error(`Redis Error:`, e)), v.connect().catch(console.error));
async function y(e) {
  return h.hash(e, 10);
}
async function b(e, t) {
  return h.compare(e, t);
}
const x = t.Router();
(x.get(
  `/`,
  f({
    query: {
      page: p.number().int().min(1).default(1).optional(),
      limit: p.number().int().min(1).max(100).default(10).optional(),
    },
  }),
  function (e, t, n) {
    t.send(`respond with a resource`);
  },
),
  x.get(`/:id`, f({ params: { id: p.string() } }), async function (e, t, n) {
    let r = await y(`123456`);
    (console.log(`加密`, r),
      console.log(`验证`, await b(`1234561`, r)),
      v
        .set(`user:${e.params.id}`, JSON.stringify({ id: e.params.id, name: `John Doe` }))
        .then(() => {
          console.log(`Cached user ${e.params.id}`);
        })
        .catch((e) => {
          (console.error(`Redis Error:`, e), t.status(500).send(`Internal Server Error`));
        }),
      v
        .get(`user:${e.params.id}`)
        .then((e) => {
          console.log(`cachedUser`, e);
        })
        .catch((e) => {
          (console.error(`Redis Error:`, e), t.status(500).send(`Internal Server Error`));
        }),
      t.send(`respond with user ${e.params.id}`));
  }));
const S = t();
(S.use(s()),
  S.use(c()),
  S.use(o()),
  S.use(t.json()),
  S.use(t.urlencoded({ extended: !1 })),
  S.use(r()),
  S.use(t.static(n.join(import.meta.dirname, `public`))),
  S.use(l({ windowMs: 9e5, limit: 100, standardHeaders: !0, legacyHeaders: !1, ipv6Subnet: 56 })),
  S.use(
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
  S.use(
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
  S.use(`/`, _),
  S.use(`/users`, x),
  S.use(function (t, n, r) {
    r(e(404));
  }),
  S.use(function (e, t, n, r) {
    n.status(e.status || 500).send(e.message || `Internal Server Error`);
  }));
const C = T(process.env.PORT || `3000`);
S.set(`port`, C);
const w = g.createServer(S);
(w.listen(C), w.on(`error`, E), w.on(`listening`, D));
function T(e) {
  let t = parseInt(e, 10);
  return isNaN(t) ? e : t >= 0 && t;
}
function E(e) {
  if (e.syscall !== `listen`) throw e;
  let t = typeof C == `string` ? `Pipe ` + C : `Port ` + C;
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
function D() {
  let e = w.address(),
    t = typeof e == `string` ? `pipe ` + e : `port ` + e?.port;
  console.log(`Listening on ` + t);
}
export {};
//# sourceMappingURL=server.js.map
