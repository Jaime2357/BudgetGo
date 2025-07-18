import db from "./dbOpen";

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

        if (!(Number(amount) > 0)) {
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
            [name, type, Number(amount), credited_to, withdrawn_from, transaction_date]);

        if (credited_to === null) { // Subtract from saving
            const initBal: { balance: number | string } | null = await db.getFirstAsync(
                'SELECT balance FROM saving_accounts WHERE id = ?', [withdrawn_from]
            );

            if (initBal === null) {
                throw new Error('Could not retrieve payment account balance');
            }

            const currentBal = Number(initBal.balance);
            const amt = Number(amount);

            let newBalance = currentBal - amt;

            await db.runAsync(
                'UPDATE saving_accounts SET balance = ? WHERE id = ?', [newBalance, withdrawn_from]
            );
        }

        if (withdrawn_from === null) { // Add to credit
            const initBal: { current_balance: number | string } | null = await db.getFirstAsync(
                'SELECT current_balance FROM credit_accounts WHERE id = ?', [credited_to]
            );

            if (initBal === null) {
                throw new Error('Could not retrieve payment credit balance');
            }

            const currentBal = Number(initBal.current_balance);
            const amt = Number(amount);

            let newBalance = currentBal + amt;

            await db.runAsync(
                'UPDATE credit_accounts SET current_balance = ? WHERE id = ?', [newBalance, credited_to]
            );
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

        // Insert Transaction
        await db.runAsync(
            `INSERT INTO transactions (name, type, amount, deposited_to, withdrawn_from, transaction_date) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, type, Number(amount), deposited_to, withdrawn_from, transaction_date]);

        // Update sender account
        const senderInitBal: { balance: number | string } | null = await db.getFirstAsync(
            'SELECT balance FROM saving_accounts WHERE id = ?', [withdrawn_from]
        );

        if (senderInitBal === null) {
            throw new Error('Could not retrieve sender account balance');
        }

        const senderBal = Number(senderInitBal.balance);
        const amt = Number(amount);

        let newSenderBalance = senderBal - amt;

        await db.runAsync(
            'UPDATE saving_accounts SET balance = ? WHERE id = ?', [newSenderBalance, withdrawn_from]
        );

        // Update receiver account
        const receiverInitBal: { balance: number | string } | null = await db.getFirstAsync(
            'SELECT balance FROM saving_accounts WHERE id = ?', [deposited_to]
        );

        if (receiverInitBal === null) {
            throw new Error('Could not retrieve receiver account balance');
        }

        const receiverBal = Number(receiverInitBal.balance);

        let newReceiverBalance = receiverBal + amt;

        await db.runAsync(
            'UPDATE saving_accounts SET balance = ? WHERE id = ?', [newReceiverBalance, deposited_to]
        );

    });

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

    console.log(paid_date)

    await db.runAsync(
        `INSERT INTO income (name, type, amount, deposited_to, received, paid_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, type, Number(amount), deposited_to, received, paid_date]);

    console.log('Deposit Successfully Posted')
}

export async function postRecIncome(
    name: string,
    type: string,
    amount: number,
    deposited_to: number,
    received: boolean,
    expected_date: number
): Promise<void> {

    await db.runAsync(
        `INSERT INTO reccurring_income (name, type, amount, deposited_to, received, expected_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, type, Number(amount), deposited_to, received, expected_date]
    );

    console.log('Deposit Successfully Posted')
}

export async function postDeposit(
    amount: number,
    deposited_to: number,
    type: string | null,
    income_id: number | null
) {

    await db.withTransactionAsync(async () => {

        const InitBal: { balance: number | string } | null = await db.getFirstAsync(
            'SELECT balance FROM saving_accounts WHERE id = ?', [deposited_to]
        );

        if (InitBal === null) {
            throw new Error('Could not retrieve account balance');
        }

        const startingBalance = Number(InitBal.balance);
        const amt = Number(amount);

        let newBalance = startingBalance + amt;
        
        await db.runAsync(
            'UPDATE saving_accounts SET balance = ? WHERE id = ?', [newBalance, deposited_to]
        );
        
        if (income_id != null) {
            if (type === 'income') {
                await db.runAsync(
                    'UPDATE income SET received = true WHERE id = ?', [income_id]
                );
            }
            else if (type === 'reccurring_income') {
                await db.runAsync(
                    'UPDATE reccurring_income SET received = true WHERE id = ?', [income_id]
                );
            }
            else {
                throw new Error("Unknown Income Type");
            }
        }
        
    });

    console.log('Deposit Successfully Posted')
}

export default {
    postSpend,
    postTransfer,
    postIncome,
    postRecIncome,
    postDeposit
};
