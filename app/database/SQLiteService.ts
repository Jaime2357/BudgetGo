import db from './dbOpen';

// Type definition
export type SavingAccount = {
  id: number;
  name: string;
  balance: number;
  threshold: number;
  modifications: number;
};

async function insertAccount(name: string, balance: number, threshold: number, modifications: number): Promise<void> {
  await db.runAsync(`INSERT INTO saving_accounts (name, balance, threshold, modifications) VALUES (?, ?, ?, ?)`,
    [name, balance, threshold, modifications]);
}

async function getAccounts(): Promise<SavingAccount[]> {
  const accounts = await db.getAllAsync('SELECT * FROM saving_accounts');
  return accounts as SavingAccount[];
};

export default {
  insertAccount,
  getAccounts
};
