// screens/NewTransaction.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/global';
import actions from '../components/actions';
import dataPost from '../database/dbPost';
import dataReq from '../database/dbReq';

import FormAmountField from '../components/forms/FormAmountField';
import FormDateField from '../components/forms/FormDateField';
import FormInputField from '../components/forms/FormInputField';
import FormPickerField from '../components/forms/FormPickerField';
import FormRadioGroup from '../components/forms/FormRadioGroup';

type PickerItem = {
    label: string;
    value: number;
};


interface Transaction {
    name: string;
    type: string;
    amount: number;
    credited_to?: number | null;
    withdrawn_from?: number | null;
    deposited_to?: number | null;
    transaction_date: Date;
    transactionType?: string;
    paymentType?: string;
}

type RadioButtonType = {
    id: string;
    label: string;
    value: string;
    selected?: boolean;
    labelStyle?: any;
};

export default function NewTransaction() {
    const router = useRouter();

    const [saving, setSaving] = useState<PickerItem[]>([]);
    const [credit, setCredit] = useState<PickerItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const [transTypeRadio, setTransTypeRadio] = useState<RadioButtonType[]>([
        { id: '1', label: 'Transfer', value: 'transfer', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
        { id: '2', label: 'Spending', value: 'spending', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
    ]);

    const [payTypeRadio, setPayTypeRadio] = useState<RadioButtonType[]>([
        { id: '1', label: 'Credit Card', value: 'credit', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
        { id: '2', label: 'Account Balance', value: 'saving', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
    ]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<Transaction>({
        defaultValues: {
            transaction_date: new Date(),
        },
    });

    const transactionType = useWatch({ control, name: 'transactionType' });
    const paymentType = useWatch({ control, name: 'paymentType' });

    useFocusEffect(
        React.useCallback(() => {
            getAccounts();
        }, [])
    );

    const getAccounts = async () => {
        const savings = await dataReq.getSaving();
        const credits = await dataReq.getCredit();

        setSaving(savings.map(a => ({ label: a.name, value: Number(a.id) })));
        setCredit(credits.map(a => ({ label: a.name, value: Number(a.id) })));

    };

    const onRefresh = async () => {
        setRefreshing(true);
        await getAccounts();
        setRefreshing(false);
    };

    const onSubmit = async (data: Transaction) => {
        setLoading(true);
        try {
            let {
                name,
                type,
                amount,
                credited_to,
                withdrawn_from,
                deposited_to,
                transaction_date,
            } = data;

            if (!credited_to) credited_to = null;
            if (!withdrawn_from) withdrawn_from = null;
            if (transactionType === 'transfer') type = 'transfer';

            if (type === 'transfer' && deposited_to != null && withdrawn_from != null) {
                await dataPost.postTransfer(name, type, Number(amount), deposited_to, withdrawn_from, actions.convertDate(transaction_date));
            } else {
                await dataPost.postSpend(name, type, Number(amount), credited_to, withdrawn_from, actions.convertDate(transaction_date));
            }

            Alert.alert('Success', 'Transaction posted successfully!', [
                { text: 'OK', onPress: () => router.replace('/') },
            ]);
        } catch {
            Alert.alert('Error', 'Something went wrong while posting.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollableContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                <View style={styles.transWelcomeHeader}>
                    <Text style={styles.transWelcomeText}>Welcome Back</Text>
                    <Text style={styles.transWelcomeSubtext}>Let's look at your finances</Text>
                </View>

                <View style={styles.transactionCardForm}>
                    <FormInputField control={control} name="name" label="Transaction Name" placeholder="Enter Transaction Name" />

                    <FormRadioGroup
                        control={control}
                        name="transactionType"
                        label="Transaction Type"
                        radioButtons={transTypeRadio}
                        setRadioButtons={setTransTypeRadio}
                    />

                    {transactionType === 'spending' && (
                        <FormInputField control={control} name="type" label="Type" placeholder="Enter Spending Type" />
                    )}

                    <FormAmountField control={control} name="amount" error={!!errors.amount} />

                    {transactionType === 'spending' && (
                        <>
                            <FormRadioGroup
                                control={control}
                                name="paymentType"
                                label="Payment Method"
                                radioButtons={payTypeRadio}
                                setRadioButtons={setPayTypeRadio}
                            />

                            {paymentType === 'credit' && (
                                <FormPickerField control={control} name="credited_to" label="Credit Card" items={credit} placeholderLabel="Select Credit Card" />
                            )}

                            {paymentType === 'saving' && (
                                <FormPickerField control={control} name="withdrawn_from" label="Account" items={saving} placeholderLabel="Select Account" />
                            )}
                        </>
                    )}

                    {transactionType === 'transfer' && (
                        <>
                            <FormPickerField control={control} name="withdrawn_from" label="Withdrawn From" items={saving} />
                            <FormPickerField control={control} name="deposited_to" label="Deposited To" items={saving} />
                        </>
                    )}

                    <FormDateField
                        control={control}
                        name="transaction_date"
                        showPicker={showPicker}
                        setShowPicker={setShowPicker}
                    />

                    <TouchableOpacity style={styles.transSubmitButton} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.transSubmitButtonText}>
                            {loading ? 'Submitting...' : 'Submit'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
