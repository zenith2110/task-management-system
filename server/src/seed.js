import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

async function run() {
  const users = [
    { name: "Alice Demo", email: "alice@example.com", password: "password123" },
    { name: "Bob Demo",   email: "bob@example.com",   password: "password123" },
  ];

  // clear old (optional for dev)
  await pool.execute("DELETE FROM tasks");
  await pool.execute("DELETE FROM users");

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const [res] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [u.name, u.email, hash]
    );
    const uid = res.insertId;
    const tasks = [
      ["Buy groceries", "pending"],
      ["Finish report", "in-progress"],
      ["Book tickets", "completed"]
    ];
    for (const [title, status] of tasks) {
      await pool.execute(
        "INSERT INTO tasks (title, status, created_by) VALUES (?, ?, ?)",
        [title, status, uid]
      );
    }
  }

  console.log("Seeded demo users and tasks.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
