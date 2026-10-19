import express from "express";
import type { Request, Response, NextFunction } from "express";
import validate from "express-zod-safe";
import { z } from "zod";
import redisClient from "../../libs/redis";
import { verifyPassword } from "../../libs/bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { authenticateToken } from "../../middlewares/auth";

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: 用户登录
 *     operationId: loginUser
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功，返回用户信息和 token
 */
router.post(
  "/",
  validate({
    body: {
      username: z.string(),
      password: z.string(),
    },
  }),
  async function (req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;

    // 从 Redis 获取用户信息
    const userData = await redisClient.get(`user:${username}`);
    if (!userData) {
      return res.status(500).json({ message: "用户名或密码错误" });
    }

    const user = JSON.parse(userData);

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(500).json({ message: "用户名或密码错误" });
    }

    // 登录成功，返回用户信息和 token
    const token = jsonwebtoken.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1h" },
    );

    res.json({ user: { id: user.id, username: user.username }, token });
  },
);

export default router;
