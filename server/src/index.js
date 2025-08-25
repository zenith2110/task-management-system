import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/task.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);      // /api/login
app.use("/api/tasks", taskRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
