import express from "express";
import type { Request, Response, NextFunction } from "express";
import validate from "express-zod-safe";
import { z } from "zod";
import redisClient from "../../libs/redis";
import { hashPassword } from "../../libs/bcrypt";

const router = express.Router();

/**
 * @swagger
 * /user/add:
 *   post:
 *     summary: 添加用户
 *     operationId: addUser
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 用户创建成功
 *       409:
 *         description: 用户已存在
 */
router.post(
  "/add",
  validate({
    body: {
      username: z.string().min(2).max(100),
      password: z.string().min(6).max(100),
    },
  }),
  async function (req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await redisClient.get(`user:${username}`);
    if (existingUser) {
      return res.status(500).json({ message: "用户已存在" });
    }

    // 创建新用户
    const hashedPassword = await hashPassword(password);
    const newUser = { id: Date.now().toString(), username, password: hashedPassword };

    // 缓存新用户
    await redisClient.set(`user:${username}`, JSON.stringify(newUser));

    res.status(200).json({ user: newUser });
  },
);

export default router;
