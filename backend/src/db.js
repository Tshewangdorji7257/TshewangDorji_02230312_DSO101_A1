import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || "./data/todos.db";

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (err) {
    console.warn(`⚠️  Could not create directory ${dbDir}, will use /tmp`);
  }
}

let tasks = [];
let nextId = 1;


export async function initDb() {
  try {
    console.log("Initializing database...");
    console.log(`Database path: ${dbPath}`);

    // Load existing data if file exists
    if (fs.existsSync(dbPath)) {
      console.log("Loading existing database...");
      const data = fs.readFileSync(dbPath, "utf-8");
      const parsed = JSON.parse(data);
      tasks = parsed.tasks || [];
      nextId = parsed.nextId || tasks.length + 1;
      console.log(`✓ Loaded ${tasks.length} tasks`);
    } else {
      console.log("Creating new database...");
      tasks = [];
      nextId = 1;
      saveDb();
    }

    console.log("✓ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    throw error;
  }
}

function saveDb() {
  try {
    // Ensure directory exists before writing
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const data = JSON.stringify({ tasks, nextId }, null, 2);
    fs.writeFileSync(dbPath, data, "utf-8");
    console.log(`✓ Database saved to ${dbPath}`);
  } catch (error) {
    console.error("❌ Error saving database:", error.message);
    throw error;
  }
}

// Get all tasks
export function getTasks() {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed)
  }));
}

// Get single task by ID
export function getTask(id) {
  return tasks.find(t => t.id === Number(id));
}

// Create new task
export function createTask(title) {
  const task = {
    id: nextId++,
    title: title.trim(),
    completed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  tasks.push(task);
  saveDb();
  return {
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed)
  };
}

// Update task
export function updateTask(id, updates) {
  const task = tasks.find(t => t.id === Number(id));
  if (!task) return null;

  if (updates.title !== undefined) {
    task.title = updates.title.trim();
  }
  if (updates.completed !== undefined) {
    task.completed = updates.completed ? 1 : 0;
  }
  task.updated_at = new Date().toISOString();

  saveDb();
  return {
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed)
  };
}

// Delete task
export function deleteTask(id) {
  const index = tasks.findIndex(t => t.id === Number(id));
  if (index === -1) return false;
  tasks.splice(index, 1);
  saveDb();
  return true;
}
