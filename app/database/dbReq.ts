import { CreditAccount, Income, PlanExpenses, RecExpenses, RecIncome, SavingAccount, Transaction } from '@/types/typeDefs';
import db from './dbOpen';

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

async function getAllTransactions(): Promise<Transaction[]> {
    const AllTransactions = await db.getAllAsync('SELECT * FROM transactions ORDER BY transaction_date ASC;');
    return AllTransactions as Transaction[];
};

async function getRecIncome(): Promise<RecIncome[]> {
    const reqIncome = await db.getAllAsync('SELECT * FROM reccurring_income WHERE received = false ORDER BY expected_date ASC;');
    return reqIncome as RecIncome[];
};

async function getAllRecIncome(): Promise<RecIncome[]> {
    const reqAllIncome = await db.getAllAsync('SELECT * FROM reccurring_income ORDER BY expected_date ASC;');
    return reqAllIncome as RecIncome[];
};

async function getIncome(): Promise<Income[]> {
    const getIncome = await db.getAllAsync('SELECT * FROM income WHERE received = false ORDER BY paid_date ASC;');
    return getIncome as Income[];
};

async function getAllIncome(): Promise<Income[]> {
    const getAllIncome = await db.getAllAsync('SELECT * FROM income ORDER BY paid_date ASC;');
    return getAllIncome as Income[];
};

export default {
    getSaving,
    getCredit,
    getRecExpenses,
    getPlanExpenses,
    getAllRecurring,
    getAllPlanned,
    getAllTransactions,
    getRecIncome,
    getAllRecIncome,
    getIncome,
    getAllIncome
};