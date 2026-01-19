import express from "express";
import db from "./db.js";
import auth from "./middleware.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  const { rows } = await db.query(
    `SELECT * FROM notifications WHERE user_id=$1 AND read=false ORDER BY created_at DESC`,
    [userId]
  );

  res.json(rows);
});

export default router;
