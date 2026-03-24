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
  try {
    console.log("Loading SQL.js...");
    console.log(`Current working directory: ${process.cwd()}`);
    
    // Try multiple possible WASM paths
    const wasmPaths = [
      path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
      '/app/node_modules/sql.js/dist/sql-wasm.wasm',
      path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm')
    ];
    
    let wasmBinary = null;
    let wasmPath = null;
    
    for (const tryPath of wasmPaths) {
      console.log(`Trying WASM path: ${tryPath}`);
      if (fs.existsSync(tryPath)) {
        console.log(`✓ Found WASM at: ${tryPath}`);
        wasmBinary = fs.readFileSync(tryPath);
        wasmPath = tryPath;
        break;
      }
    }
    
    if (!wasmBinary) {
      console.log("WASM file not found in any expected location, using default locateFile...");
      SQL = await initSqlJs();
    } else {
      console.log("Loading WASM from binary...");
      SQL = await initSqlJs({ wasmBinary });
    }
    
    console.log("✓ SQL.js loaded successfully");
    console.log(`Using database path: ${fullPath}`);

    // Load existing DB from file or create new
    if (fs.existsSync(fullPath)) {
      console.log("Loading existing database file...");
      const data = fs.readFileSync(fullPath);
      db = new SQL.Database(data);
      console.log("✓ Database loaded from file");
    } else {
      console.log("Creating new database...");
      db = new SQL.Database();
      console.log("✓ New database created");
    }

    // Create table
    console.log("Creating tasks table...");
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Tasks table created");

    saveDb();
    console.log("✓ Database initialization complete");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

export function saveDb() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(fullPath, buffer);
    console.log(`Database saved to ${fullPath}`);
  } catch (error) {
    console.error("Error saving database:", error);
    throw error;
  }
}
