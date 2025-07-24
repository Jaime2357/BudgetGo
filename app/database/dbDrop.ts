import db from "./dbOpen";

export async function dropAccount(id: number) {
console.log(id)
    await db.runAsync(`DELETE FROM saving_accounts WHERE id = ?`, [id]);
    console.log('Account Deleted Successfully');

}

export async function dropCredit(id: number) {

    await db.runAsync(`DELETE FROM credit_accounts WHERE id = ?`, [id]);
    console.log('Credit Card Deleted Successfully');

}

export async function dropRecExpense(id: number) {

    await db.runAsync(`DELETE FROM reccurring_expenses WHERE id = ?`, [id]);
    console.log('Reccurring Expense Deleted Successfully');

}

export async function dropPlanExpense(id: number) {

    await db.runAsync(`DELETE FROM planned_expenses WHERE id = ?`, [id]);
    console.log('Planned Expense Deleted Successfully');

}

export async function dropRecIncome(id: number) {

    await db.runAsync(`DELETE FROM reccurring_income WHERE id = ?`, [id]);
    console.log('Reccurring Income Deleted Successfully');

}

export async function dropIncome(id: number) {

    await db.runAsync(`DELETE FROM income WHERE id = ?`, [id]);
    console.log('Income Deleted Successfully');

}

export async function dropTransaction(id: number) {

    await db.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
    console.log('Transaction Deleted Successfully');

}

export default {
   dropAccount,
   dropCredit,
   dropRecExpense,
   dropPlanExpense,
   dropRecIncome,
   dropIncome,
   dropTransaction
};
