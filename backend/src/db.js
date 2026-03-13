import dotenv from "dotenv";
import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || "./data/todos.db";
const fullPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);

// Ensure data directory exists
const dataDir = path.dirname(fullPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let SQL;
export let db = null;

export async function initDb() {
  SQL = await initSqlJs();

  // Load existing DB from file or create new
  if (fs.existsSync(fullPath)) {
    const data = fs.readFileSync(fullPath);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
  }

  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  saveDb();
}

export function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(fullPath, buffer);
}
