import express from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticateToken } from "../../middlewares/authorize";

const router = express.Router();

router.use(authenticateToken);

// 获取首页数据
router.get("/", async function (req: Request, res: Response, next: NextFunction) {
  console.log("获取请求头信息:", req.get("User-Agent"));
  console.log("获取Authorization头信息:", req.get("Authorization"));
  // 这里可以添加获取首页数据的逻辑
  res.json({ message: "欢迎来到首页" });
});

export default router;
