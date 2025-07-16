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

export type RecExpenses = {
    id: number;
    name: string;
    type: string;
    amount: number;
    credited_to: number;
    paid_for_month: boolean;
    reccurring_date: number;
}

export type PlanExpenses = {
    id: number;
    name: string;
    type: string;
    amount: number;
    credited_to: number;
    withdrawn_from: number;
    paid: boolean;
    paid_date: Date;
}

async function getSaving(): Promise<SavingAccount[]> {
    const savings = await db.getAllAsync('SELECT * FROM saving_accounts');
    return savings as SavingAccount[];
};

async function getCredit(): Promise<CreditAccount[]> {
    const accounts = await db.getAllAsync('SELECT * FROM credit_accounts');
    return accounts as CreditAccount[];
};

async function getRecExpenses(): Promise<RecExpenses[]> {
    const recExpenses = await db.getAllAsync('SELECT * FROM reccurring_expenses WHERE paid_for_month = false ORDER BY reccurring_date ASC;');
    return recExpenses as RecExpenses[];
};

async function getPlanExpenses(): Promise<PlanExpenses[]> {
    const planExpenses = await db.getAllAsync('SELECT * FROM planned_expenses WHERE paid = false ORDER BY paid_date ASC;');
    return planExpenses as PlanExpenses[];
};

async function getAllRecurring(): Promise<RecExpenses[]> {
    const allReccurring = await db.getAllAsync('SELECT * FROM reccurring_expenses ORDER BY reccurring_date ASC;');
    return allReccurring as RecExpenses[];
};

async function getAllPlanned(): Promise<PlanExpenses[]> {
    const allPlanned = await db.getAllAsync('SELECT * FROM planned_expenses ORDER BY paid_date ASC;');
    return allPlanned as PlanExpenses[];
};

export default {
    getSaving,
    getCredit,
    getRecExpenses,
    getPlanExpenses,
    getAllRecurring,
    getAllPlanned
};