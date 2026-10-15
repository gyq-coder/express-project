import express from "express";
import type { Request, Response, NextFunction } from "express";
import validate from "express-zod-safe";
import { z } from "zod";
import redisClient from "../../libs/redis";
import { hashPassword, verifyPassword } from "../../libs/bcrypt";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 用户列表
 *     operationId: getUsers
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: 返回资源
 */
router.get(
  "/",
  validate({
    query: {
      page: z.number().int().min(1).default(1).optional(),
      limit: z.number().int().min(1).max(100).default(10).optional(),
    },
  }),
  function (req: Request, res: Response, next: NextFunction) {
    res.send("respond with a resource");
  },
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 获取用户详情
 *     operationId: getUsersById  
 *     tags:
 *       - Users  
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回资源详情
 */
router.get(
  "/:id",
  validate({
    params: {
      id: z.string(),
    },
  }),
  async function (req: Request, res: Response, next: NextFunction) {
    const passwordHash = await hashPassword("123456");
    console.log("加密", passwordHash);
    console.log("验证", await verifyPassword("1234561", passwordHash));
    redisClient
      .set(`user:${req.params.id}`, JSON.stringify({ id: req.params.id, name: "John Doe" }))
      .then(() => {
        console.log(`Cached user ${req.params.id}`);
      })
      .catch((err) => {
        console.error("Redis Error:", err);
        res.status(500).send("Internal Server Error");
      });
    redisClient
      .get(`user:${req.params.id}`)
      .then((cachedUser) => {
        console.log("cachedUser", cachedUser);
      })
      .catch((err) => {
        console.error("Redis Error:", err);
        res.status(500).send("Internal Server Error");
      });

    res.send(`respond with user ${req.params.id}`);
  },
);

export default router;
