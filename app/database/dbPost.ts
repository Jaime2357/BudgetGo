import db from "./dbOpen";

type BalanceRow = {
    balance: number;
};

export async function postSpend(
    name: string,
    type: string | null,
    amount: number,
    credited_to: number | null,
    withdrawn_from: number | null,
    transaction_date: string
): Promise<void> {

    console.log(name, type, amount, credited_to, withdrawn_from, transaction_date)

    await db.withTransactionAsync(async () => {

        if (!(amount > 0)) {
            throw new Error('Transaction amount must be positive');
        }
        if (credited_to === null && withdrawn_from === null) {
            throw new Error('No payment account ID specified')
        }
        else if (credited_to !== null && withdrawn_from !== null) {
            throw new Error('Ambiguous: cannot credit and withdraw in the same spend');
        }

        await db.runAsync(
            `INSERT INTO transactions (name, type, amount, credited_to, withdrawn_from, transaction_date) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, type, amount, credited_to, withdrawn_from, transaction_date]);

        if (credited_to === null) { // If credited_to is null, subtract from specified saving account

            const initBal: { balance: number } | null = await db.getFirstAsync(
                'SELECT balance FROM saving_accounts WHERE id = ?', [withdrawn_from]
            );

            if (initBal === null) {
                throw new Error('Could not retrieve payment account balance');
            }

            let newBalance = initBal.balance - amount;

            await db.runAsync(
                'UPDATE saving_accounts SET balance = ? WHERE id = ?', [newBalance, withdrawn_from])
        }

        if (withdrawn_from === null) { // If withdrawn_from is null, add to specified credit balance

            const initBal: { current_balance: number } | null = await db.getFirstAsync(
                'SELECT current_balance FROM credit_accounts WHERE id = ?', [credited_to]
            );

            if (initBal === null) {
                throw new Error('Could not retrieve payment credit balance');
            }

            let newBalance = initBal.current_balance + amount;

            await db.runAsync(
                'UPDATE credit_accounts SET current_balance = ? WHERE id = ?', [newBalance, credited_to])
        }

    })
    console.log('Spend Successfully Posted')
}

export async function postTransfer(
    name: string,
    type: string | null,
    amount: number,
    deposited_to: number,
    withdrawn_from: number,
    transaction_date: string
): Promise<void> {

    await db.withTransactionAsync(async () => {

        // Update Transaction Records
        await db.runAsync(
            `INSERT INTO transactions (name, type, amount, deposited_to, withdrawn_from, transaction_date) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, type, amount, deposited_to, withdrawn_from, transaction_date]);

        // Update balance from sending account
        const senderInitBal: { balance: number } | null = await db.getFirstAsync(
            'SELECT balance FROM saving_accounts WHERE id = ?', [withdrawn_from]
        );

        if (senderInitBal === null) {
            throw new Error('Could not retrieve sender account balance');
        }

        let newSenderBalance = senderInitBal.balance - amount;

        await db.runAsync(
            'UPDATE saving_accounts SET balance = ? WHERE id = ?', [newSenderBalance, withdrawn_from]
        )

        // Update balance from receiving account
        const receiverInitBal: { balance: number } | null = await db.getFirstAsync(
            'SELECT balance FROM saving_accounts WHERE id = ?', [deposited_to]
        );

        if (receiverInitBal === null) {
            throw new Error('Could not retrieve receiver account balance');
        }

        let newReceiverBalance = receiverInitBal.balance + amount;

        await db.runAsync(
            'UPDATE saving_accounts SET balance = ? WHERE id = ?', [newReceiverBalance, deposited_to]
        )
    })

    console.log('Transfer Successfully Posted')
}

export async function postIncome(
    name: string,
    type: string | null,
    amount: number,
    deposited_to: number,
    received: boolean,
    paid_date: string
): Promise<void> {

    await db.runAsync(
        `INSERT INTO income (name, type, amount, deposited_to, received, paid_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, type, amount, deposited_to, received, paid_date]);

    console.log('Deposit Successfully Posted')
}

export default {
    postSpend,
    postTransfer,
    postIncome
};