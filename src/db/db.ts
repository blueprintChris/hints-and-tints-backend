import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

export const openDb = async () => {
  const db = await open({
    filename: 'game.db',
    driver: sqlite3.Database,
  });

  return db;
};

export const createRoomsTable = async (db: Database<sqlite3.Database, sqlite3.Statement>) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT UNIQUE
    );
  `);
};
