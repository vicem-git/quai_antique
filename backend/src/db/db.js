import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

let db;

export async function initDb() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const schema = fs.readFile(schemaPath, 'utf8');
  try {
    await db.exec(schema);
  } catch (error) {
    console.error('Error initializing database schema:', error);
    process.exit(1);
  }

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized.');
  }
  return db;
}
