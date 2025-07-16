import db from './dbOpen';

export type PlanExpenses = {
  id: number;
  name: string;
  type: string;
  amount: number;
  paid: boolean;
  paid_date: Date;
}

async function insertExpense(
  name: string,
  type: string,
  amount: number,
  paid: boolean,
  paid_date: Date): Promise<void> {

  const paid_date_str = paid_date.toISOString().slice(0, 19).replace('T', ' '); // "2025-07-15 22:15:00"

  await db.runAsync(
    `INSERT INTO planned_expenses (name, type, amount, paid, paid_date) VALUES (?, ?, ?, ?, ?)`,
    [name, type, amount, paid, paid_date_str]);
}

export default {
  insertExpense
};
