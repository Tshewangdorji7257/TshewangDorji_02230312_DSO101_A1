import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { initDb, db, saveDb } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  credentials: false
}));

app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper to run query and get all rows
function dbAll(sql) {
  const stmt = db.prepare(sql);
  const rows = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push(row);
  }
  stmt.free();
  return rows;
}

// Helper to run query and get first row
function dbGet(sql) {
  const stmt = db.prepare(sql);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

// Helper to run INSERT/UPDATE/DELETE
function dbRun(sql) {
  db.run(sql);
  saveDb();
}

app.get("/tasks", (_req, res) => {
  try {
    const rows = dbAll(
      "SELECT id, title, completed FROM tasks ORDER BY id DESC"
    );
    res.json(rows.map(row => ({ ...row, completed: Boolean(row.completed) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    dbRun(`INSERT INTO tasks(title) VALUES('${title.trim().replace(/'/g, "''")}')`);
    const result = dbGet(
      "SELECT id, title, completed FROM tasks ORDER BY id DESC LIMIT 1"
    );
    res.status(201).json({ ...result, completed: Boolean(result.completed) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  try {
    const taskId = Number(id);
    const updates = [];

    if (title !== undefined) {
      updates.push(`title = '${String(title).trim().replace(/'/g, "''")}'`);
    }
    if (completed !== undefined) {
      updates.push(`completed = ${Boolean(completed) ? 1 : 0}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    const query = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ${taskId}`;
    dbRun(query);

    const updated = dbGet(
      `SELECT id, title, completed FROM tasks WHERE id = ${taskId}`
    );

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ ...updated, completed: Boolean(updated.completed) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  try {
    const taskId = Number(id);
    const exists = dbGet(`SELECT id FROM tasks WHERE id = ${taskId}`);

    if (!exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    dbRun(`DELETE FROM tasks WHERE id = ${taskId}`);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    console.log("=== Backend Server Startup ===");
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Port: ${PORT}`);
    
    console.log("\nInitializing database...");
    await initDb();
    console.log("✓ Database initialized successfully\n");
    
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("=== Server Ready ===");
      console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
      console.log(`✓ CORS enabled for all origins`);
      console.log(`✓ Database: ${process.env.DB_PATH || './data/todos.db'}`);
      console.log("============================\n");
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });

  } catch (error) {
    console.error("=== Startup Failed ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

start();
