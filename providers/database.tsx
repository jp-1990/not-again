import React, { PropsWithChildren } from "react";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { EventEmitter } from "expo";

export { useSQLiteContext as useDatabaseContext } from "expo-sqlite";

export default function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName="monthly-info.db" onInit={migrateDbIfNeeded}>
      {children}
    </SQLiteProvider>
  );
}

export type SQLEntry = {
  id: number;
  /**
   * 0 or 1
   */
  start: number;
  /**
   * user-entered date
   */
  date: number;
  /**
   * insertion timestamp
   */
  createdAt: string;
  notes?: string | null;
  cycle?: number | null;
};
export type SQLEntries = SQLEntry[];

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;

  let res = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  console.log("db version", res);
  if (!res) {
    throw new Error("failed to get db version");
  }
  let currentDbVersion = res.user_version;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE entries (id INTEGER PRIMARY KEY NOT NULL, start INTEGER DEFAULT 1, date INTEGER NOT NULL, notes TEXT, cycle INTEGER, createdAt TEXT DEFAULT CURRENT_TIMESTAMP);
`);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const DBEvents = new EventEmitter<{
  create: (args?: Pick<SQLEntry, "date" | "cycle" | "notes">) => void;
  update: (args?: SQLEntry) => void;
}>();

export function emitCreate(data?: Pick<SQLEntry, "date" | "cycle" | "notes">) {
  DBEvents.emit("create", data);
}

export function emitUpdate(data?: SQLEntry) {
  DBEvents.emit("update", data);
}

export function listenCreate(cb: () => any) {
  DBEvents.addListener("create", cb);
  return () => DBEvents.removeListener("create", cb);
}

export function listenUpdate(cb: () => any) {
  DBEvents.addListener("update", cb);
  return () => DBEvents.removeListener("update", cb);
}
