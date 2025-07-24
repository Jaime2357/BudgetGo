import db from "./dbOpen";

export async function addNewAccount(name: string, balance: number, image_uri: string | null) {

    await db.runAsync(`INSERT INTO saving_accounts (name, balance, image_uri) VALUES (?, ?, ?)`, 
        [name, balance, image_uri]);
    console.log('New Account Added');
}

export async function addNewCredit(name: string, current_balance: number, image_uri: string | null) {

    await db.runAsync(`INSERT INTO credit_accounts (name, current_balance, image_uri) VALUES (?, ?, ?)`, 
        [name, current_balance, image_uri]);
    console.log('New Credit Card Added');
}

export async function updateSavingAccount(
    id: number,
    name: string, 
    balance: number,
    threshold: number,
    modifications: number,
    image_uri: string | null
){

    await db.runAsync(`UPDATE saving_accounts 
        SET name = ?, balance = ?, threshold = ?, modifications = ?, image_uri = ? WHERE id = ?`,
    [name, balance, threshold, modifications, image_uri, id])

    console.log('Saving Account Updated')

}

export async function updateCreditAccount(
    id: number,
    name: string, 
    current_balance: number,
    pending_charges: number,
    image_uri: string | null
){

    await db.runAsync(`UPDATE credit_accounts 
        SET name = ?, current_balance = ?, pending_charges = ?, image_uri = ? WHERE id = ?`,
    [name, current_balance, pending_charges, image_uri, id])

    console.log('Credit Card Updated')

}

export async function newSpend(
    name: string,
    type: string | null,
    amount: number,
    credited_to: number | null,
    withdrawn_from: number | null,
    transaction_date: string
): Promise<void> {

    console.log(name, type, amount, credited_to, withdrawn_from, transaction_date)

    await db.withTransactionAsync(async () => {

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

            let newBalance 
            if(type = 'credit_payment'){ // Payments deduct from balance
                newBalance = currentBal - amt;
            }
            else{ // Charges add to balance
                newBalance = currentBal + amt;
            }

            await db.runAsync(
                'UPDATE credit_accounts SET current_balance = ? WHERE id = ?', [newBalance, credited_to]
            );
        }

    })
    console.log('Transaction Successfully Posted')
}

export async function logRecSpend(
    id: number,
    name: string,
    type: string | null,
    amount: number,
    credited_to: number | null,
    reccurring_date: string
): Promise<void> {

    console.log(name, type, amount, credited_to, reccurring_date)

    await db.withTransactionAsync(async () => {

        if (!(Number(amount) > 0)) {
            throw new Error('Transaction amount must be positive');
        }
        if (credited_to === null) {
            throw new Error('No payment account ID specified')
        }

        await db.runAsync(
            `INSERT INTO transactions (name, type, amount, credited_to, transaction_date) VALUES (?, ?, ?, ?, ?)`,
            [name, type, Number(amount), credited_to, reccurring_date]);


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

        await db.runAsync(
            'UPDATE reccurring_expenses SET paid_for_month = true WHERE id = ?', [id]
        );

    })
    console.log('Monthly Spend Successfully Posted')
}

export async function logPlanSpend(
    id: number,
    name: string,
    type: string | null,
    amount: number,
    credited_to: number | null,
    withdrawn_from: number | null,
    paid_date: string
): Promise<void> {

    console.log('Reached: ', id, name, type, amount, credited_to, withdrawn_from, paid_date)
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
            [name, type, Number(amount), credited_to, withdrawn_from, paid_date]);

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

        await db.runAsync(
            'UPDATE planned_expenses SET paid = true WHERE id = ?', [id]
        );

    })
    console.log('Planned Spend Successfully Posted')
}

export async function updateRecSpend(
    id: number,
    name: string,
    type: string | null,
    amount: number,
    credited_to: number | null,
    reccurring_date: number
): Promise<void> {

    await db.runAsync(
        'UPDATE reccurring_expenses SET name = ?, type = ?, amount = ?, credited_to = ?, reccurring_date = ?, paid_for_month = true WHERE id = ?',
        [name, type, amount, credited_to, reccurring_date, id]
    );

    console.log('Monthly Spend Successfully Updated')
}

export async function updatePlanSpend(
    id: number,
    name: string,
    type: string | null,
    amount: number,
    credited_to: number | null,
    withdrawn_from: number | null,
    paid_date: string
): Promise<void> {

    await db.runAsync(
        'UPDATE planned_expenses SET name = ?, type = ?, amount = ?, credited_to = ?, withdrawn_from = ?, paid_date = ?, paid = true WHERE id = ?',
        [name, type, amount, credited_to, withdrawn_from, paid_date, id]
    );

    console.log('Monthly Spend Successfully Updated')
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

export async function postPlannedExpense(
    name: string,
    type: string | null,
    amount: number,
    paid_date: string,
    credited_to: number | null,
    withdrawn_from: number | null,
): Promise<void> {

    console.log(paid_date)

    await db.runAsync(
        `INSERT INTO planned_expenses (name, type, amount, paid, paid_date, credited_to, withdrawn_from) VALUES (?, ?, ?, false, ?, ?, ?)`,
        [name, type, Number(amount), paid_date, credited_to, withdrawn_from]);

    console.log('Planned Expense Successfully Posted')
}

export async function postRecExpense(
    name: string,
    type: string | null,
    amount: number,
    credited_to: number,
    reccurring_date: number
): Promise<void> {

    console.log(name, type, amount, credited_to, reccurring_date)

    await db.runAsync(
        `INSERT INTO reccurring_expenses (name, type, amount, paid_for_month, credited_to, reccurring_date) VALUES (?, ?, ?, false, ?, ?)`,
        [name, type, Number(amount), credited_to, reccurring_date]
    );

    console.log('Reccurring Expense Successfully Posted')
}

export async function monthlyPreset() {

    await db.withTransactionAsync(async () => {
        await db.runAsync(`UPDATE reccurring_income SET monthly_reset = false`)
        await db.runAsync(`UPDATE reccurring_expenses SET monthly_reset = false`)
    })

    console.log('Monthly Preset Successful')
}

export async function monthlyReset() {

    await db.withTransactionAsync(async () => {
        await db.runAsync(`UPDATE reccurring_income SET received = false, monthly_reset = true WHERE monthly_reset = false`)
        await db.runAsync(`UPDATE reccurring_expenses SET paid_for_month = false, monthly_reset = true WHERE monthly_reset = false`)
    })

    console.log('Monthly Reset Successful')

}

export default {
    addNewAccount,
    addNewCredit,
    updateSavingAccount,
    updateCreditAccount,
    newSpend,
    logRecSpend,
    logPlanSpend,
    updateRecSpend,
    updatePlanSpend,
    postTransfer,
    postIncome,
    postRecIncome,
    postDeposit,
    postPlannedExpense,
    postRecExpense,
    monthlyPreset,
    monthlyReset
};
