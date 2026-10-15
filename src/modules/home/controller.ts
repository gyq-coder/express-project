import express from "express";
import type { Request, Response, NextFunction } from "express";
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: 首页
 *     operationId: getHome
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: 返回根信息
 */
router.get("/", function (req: Request, res: Response, next: NextFunction) {
  console.log(req.cookies);
  res.send("root");
});

export default router;
