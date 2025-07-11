import db from "./dbOpen";

const initDB = async (): Promise<void> => {

    await db.withTransactionAsync(async () => {
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS saving_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance NUMERIC NOT NULL DEFAULT 0,
        threshold NUMERIC NOT NULL DEFAULT 0,
        modifications NUMERIC DEFAULT 0
      );`
        );

        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS credit_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        current_balance NUMERIC NOT NULL DEFAULT 0,
        true_balance NUMERIC NOT NULL DEFAULT 0,
        pending_charges NUMERIC DEFAULT 0
      );`
        );

        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS reccurring_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        paid_for_month BOOLEAN DEFAULT 0,
        reccurring_date DATE
      );`
        );

        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS planned_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        paid BOOLEAN DEFAULT 0,
        paid_date DATE NOT NULL
      );`
        );

        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        received BOOLEAN DEFAULT 0,
        paid_date DATE NOT NULL
      );`
        );

        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        credited_to INTEGER,
        withdrawn_from INTEGER,
        transaction_date DATE NOT NULL,
        FOREIGN KEY (credited_to) REFERENCES credit_accounts(id),
        FOREIGN KEY (withdrawn_from) REFERENCES saving_accounts(id)
      );`
        );
    });
};

export default initDB