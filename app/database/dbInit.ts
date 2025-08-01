import db from "./dbOpen";

const initDB = async (): Promise<void> => {

  await db.withTransactionAsync(async () => {

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS saving_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance NUMERIC NOT NULL DEFAULT 0,
        threshold NUMERIC NOT NULL DEFAULT 0,
        modifications NUMERIC DEFAULT 0,
        image_uri TEXT
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS credit_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        current_balance NUMERIC NOT NULL DEFAULT 0,
        pending_charges NUMERIC DEFAULT 0,
        image_uri TEXT
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS reccurring_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        paid_for_month BOOLEAN DEFAULT 0,
        monthly_reset BOOLEAN NOT NULL DEFAULT 0,
        credited_to INTEGER,
        reccurring_date INTEGER CHECK (reccurring_date > 0 AND reccurring_date < 32),
        FOREIGN KEY (credited_to) REFERENCES credit_accounts(id) ON DELETE CASCADE
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS planned_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT "Other",
        amount NUMERIC NOT NULL DEFAULT 0,
        paid BOOLEAN DEFAULT 0,
        paid_date DATE NOT NULL,
        credited_to INTEGER,
        withdrawn_from INTEGER,
        FOREIGN KEY (credited_to) REFERENCES credit_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (withdrawn_from) REFERENCES saving_accounts(id) ON DELETE CASCADE
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS reccurring_income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Other',
        amount NUMERIC NOT NULL DEFAULT 0,
        deposited_to INTEGER NOT NULL,
        received BOOLEAN DEFAULT 0,
        monthly_reset BOOLEAN NOT NULL DEFAULT 0,
        expected_date INTEGER NOT NULL,
        FOREIGN KEY (deposited_to) REFERENCES saving_accounts(id) ON DELETE CASCADE
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Other',
        amount NUMERIC NOT NULL DEFAULT 0,
        deposited_to INTEGER NOT NULL,
        received BOOLEAN DEFAULT 0,
        paid_date DATE NOT NULL,
        FOREIGN KEY (deposited_to) REFERENCES saving_accounts(id) ON DELETE CASCADE
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Other',
        amount NUMERIC NOT NULL DEFAULT 0,
        credited_to INTEGER,
        withdrawn_from INTEGER,
        deposited_to INTEGER,
        transaction_date DATE NOT NULL,
        FOREIGN KEY (credited_to) REFERENCES credit_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (withdrawn_from) REFERENCES saving_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (deposited_to) REFERENCES saving_accounts(id) ON DELETE CASCADE
      );`
    );
  });

};

export default initDB