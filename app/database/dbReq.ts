import db from './dbOpen';

// Type definition
export type SavingAccount = {
    id: number;
    name: string;
    balance: number;
    threshold: number;
    modifications: number;
};

export type CreditAccount = {
    id: number;
    name: string;
    current_balance: number;
    true_balance: number;
    pending_charges: number;
};

async function getSaving(): Promise<SavingAccount[]> {
    const savings = await db.getAllAsync('SELECT * FROM saving_accounts');
    return savings as SavingAccount[];
};

async function getCredit(): Promise<CreditAccount[]> {
    const accounts = await db.getAllAsync('SELECT * FROM credit_accounts');
    return accounts as CreditAccount[];
};

export default {
    getSaving,
    getCredit
};