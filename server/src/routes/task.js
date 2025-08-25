import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = Router();

const statusAllowed = ["pending","in-progress","completed"];

router.use(auth);

// GET /api/tasks - tasks for authenticated user
router.get("/", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, title, status, created_at FROM tasks WHERE created_by = ? ORDER BY id DESC",
    [req.user.id]
  );
  res.json(rows);
});

// POST /api/tasks - create
router.post(
  "/",
  body("title").isString().trim().isLength({ min: 1 }),
  body("status").optional().isIn(statusAllowed),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, status = "pending" } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO tasks (title, status, created_by) VALUES (?, ?, ?)",
      [title, status, req.user.id]
    );
    const [rows] = await pool.execute(
      "SELECT id, title, status, created_at FROM tasks WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  }
);

// PUT /api/tasks/:id - update title/status
router.put(
  "/:id",
  param("id").isInt(),
  body("title").optional().isString().trim().isLength({ min: 1 }),
  body("status").optional().isIn(statusAllowed),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { title, status } = req.body;

    // ensure task belongs to user
    const [exists] = await pool.execute(
      "SELECT id FROM tasks WHERE id = ? AND created_by = ?",
      [id, req.user.id]
    );
    if (!exists.length) return res.status(404).json({ error: "Task not found" });

    const fields = [];
    const values = [];
    if (title) { fields.push("title = ?"); values.push(title); }
    if (status) { fields.push("status = ?"); values.push(status); }
    if (!fields.length) return res.status(400).json({ error: "Nothing to update" });

    values.push(id, req.user.id);
    await pool.execute(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ? AND created_by = ?`,
      values
    );

    const [row] = await pool.execute(
      "SELECT id, title, status, created_at FROM tasks WHERE id = ?",
      [id]
    );
    res.json(row[0]);
  }
);

// DELETE /api/tasks/:id
router.delete(
  "/:id",
  param("id").isInt(),
  async (req, res) => {
    const { id } = req.params;
    const [result] = await pool.execute(
      "DELETE FROM tasks WHERE id = ? AND created_by = ?",
      [id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  }
);

export default router;
