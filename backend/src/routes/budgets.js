import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ======================================================
   HELPERS
====================================================== */
const VALID_PERIODS = ["weekly", "monthly", "yearly"];

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const defaultStartDate = (period) => {
  const now = new Date();

  switch (period) {
    case "weekly":
      now.setDate(now.getDate() - 7);
      break;
    case "yearly":
      now.setMonth(0, 1);
      break;
    default:
      now.setDate(1);
  }

  return normalizeDate(now);
};

/* ======================================================
   GET BUDGETS (WITH LIVE USAGE)
====================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        b.id,
        b.category_id,
        c.name AS category,
        b.amount AS limit,
        b.period,
        b.start_date,
        COALESCE(SUM(ABS(t.amount)), 0) AS used
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t
        ON t.user_id = b.user_id
       AND t.category_id = b.category_id
       AND t.type = 'expense'
       AND t.occurred_at >= b.start_date
      WHERE b.user_id = $1
      GROUP BY b.id, c.id
      ORDER BY c.name ASC
      `,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Get budgets failed:", err);
    res.status(500).json({ error: "Failed to load budgets" });
  }
});


/* ======================================================
   CREATE BUDGET
====================================================== */
router.post("/", auth, async (req, res) => {
  const client = await pool.connect();

  try {
    let {
      category_id,
      category,
      amount,
      period = "monthly",
      start_date,
    } = req.body;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    if (!VALID_PERIODS.includes(period)) {
      return res.status(400).json({ error: "Invalid budget period" });
    }

    if (!category_id && !category) {
      return res.status(400).json({ error: "Category is required" });
    }

    await client.query("BEGIN");

    /* ---------- Resolve Category ---------- */
    if (!category_id) {
      const { rows } = await client.query(
        `
        INSERT INTO categories (name)
        VALUES ($1)
        ON CONFLICT (LOWER(name))
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
        `,
        [category]
      );

      category_id = rows[0].id;
    }

    /* ---------- Normalize Start Date ---------- */
    const start = normalizeDate(
      start_date ?? defaultStartDate(period)
    );

    const { rows } = await client.query(
      `
      INSERT INTO budgets (
        user_id,
        category_id,
        amount,
        period,
        start_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [req.user.id, category_id, amount, period, start]
    );

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create budget failed:", err);
    res.status(500).json({ error: "Failed to create budget" });
  } finally {
    client.release();
  }
});

/* ======================================================
   UPDATE BUDGET
====================================================== */
router.put("/:id", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    const { rows } = await pool.query(
      `
      UPDATE budgets
      SET amount = $1
      WHERE id = $2
        AND user_id = $3
      RETURNING *
      `,
      [amount, req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Update budget failed:", err);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

/* ======================================================
   DELETE BUDGET
====================================================== */
router.delete("/:id", auth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `
      DELETE FROM budgets
      WHERE id = $1
        AND user_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (!rowCount) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete budget failed:", err);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

export default router;
