import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";

const db: SQLiteDatabase = openDatabaseSync('Budgetdb.db');
export default db;
