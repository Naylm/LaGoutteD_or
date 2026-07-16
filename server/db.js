import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = process.env.DATA_DIR || join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'lagouttedor.db');

export const db = await open({
  filename: dbPath,
  driver: sqlite3.Database
});

await db.exec('PRAGMA foreign_keys = ON');

const schemaPath = join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
await db.exec(schema);

export async function resetDatabase() {
  await db.exec('DELETE FROM cocktail_ingredients; DELETE FROM cocktail_pages; DELETE FROM cocktails; DELETE FROM ingredients; DELETE FROM categories; DELETE FROM pages;');
}
