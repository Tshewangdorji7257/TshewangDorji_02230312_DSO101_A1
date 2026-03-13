import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";

const dbPath = "./data/todos.db";

async function inspect() {
  try {
    if (!fs.existsSync(dbPath)) {
      console.log("❌ Database file not found at", dbPath);
      return;
    }

    const SQL = await initSqlJs();
    const data = fs.readFileSync(dbPath);
    const db = new SQL.Database(data);

    console.log("\n📋 Database Contents:\n");

    // Get all tasks
    const stmt = db.prepare("SELECT * FROM tasks");
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    if (rows.length === 0) {
      console.log("(no tasks yet)");
    } else {
      console.table(rows);
    }

    db.close();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspect();
