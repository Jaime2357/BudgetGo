import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from "react";
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import RadioGroup from 'react-native-radio-buttons-group';
import { SafeAreaView } from 'react-native-safe-area-context';


import { pickerStyles, styles } from '@/styles/global';
import dataPost from '../database/dbPost';
import dataReq from '../database/dbReq';

type PickerItem = {
    label: string;
    value: number | string;
};

interface Transaction {
    name: string;
    type: string;
    amount: number;
    credited_to?: number | null;
    withdrawn_from?: number | null;
    deposited_to?: number | null;
    transaction_date: Date;
    // Optionally:
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

    useFocusEffect(
        React.useCallback(() => {
            getAccounts();
        }, [])
    );


    async function getAccounts() {
        const savings = await dataReq.getSaving();
        const credits = await dataReq.getCredit();

        const savingMap = savings.map(account => ({
            label: account.name,
            value: account.id
        }));

        const creditMap = credits.map(account => ({
            label: account.name,
            value: account.id
        }));

        setSaving(savingMap);
        setCredit(creditMap);
    }

    const [saving, setSaving] = useState<PickerItem[]>([]);
    const [credit, setCredit] = useState<PickerItem[]>([])

    const [refreshing, setRefreshing] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<Transaction>({
        defaultValues: {
            transaction_date: new Date()
        }
    });
    const [showPicker, setShowPicker] = useState(false);
    const transactionType = useWatch({ control, name: 'transactionType' });
    const paymentType = useWatch({ control, name: 'paymentType' });
    const [loading, setLoading] = useState(false);
    const [transTypeRadio, setTransTypeRadio] = useState<RadioButtonType[]>([
        {
            id: '1', label: 'Transfer', value: 'transfer', selected: false,
            labelStyle: {fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
        {
            id: '2', label: 'Spending', value: 'spending', selected: false,
            labelStyle: {fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
    ]);
    const [payTypeRadio, setPayTypeRadio] = useState([
        {
            id: '1', label: 'Credit Card', value: 'credit', selected: false,
            labelStyle: {fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
        {
            id: '2', label: 'Account Balance', value: 'saving', selected: false,
            labelStyle: {fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
    ]);

    const onRefresh = async () => {
        setRefreshing(true);
        await getAccounts(); // Call your data reload logic here
        setRefreshing(false);
    };

    function convertDate(date: Date) {
        // Pad function for double digits
        const pad = (d: number) => d.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());
        const second = pad(date.getSeconds());

        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    async function onSubmit(data: Transaction) {
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

            if (credited_to === undefined) {
                credited_to = null;
            }
            if (withdrawn_from === undefined) {
                withdrawn_from = null;
            }
            if (transactionType === 'transfer') {
                type = transactionType;
            }

            if (type === 'transfer' && deposited_to != null && withdrawn_from != null) {
                await dataPost.postTransfer(name, type, Number(amount), deposited_to, withdrawn_from, convertDate(transaction_date));
            } else {
                await dataPost.postSpend(name, type, Number(amount), credited_to, withdrawn_from, convertDate(transaction_date));
            }

            // Show success alert
            Alert.alert(
                "Success",
                "Transaction posted successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace('/'), // Navigate after OK
                    },
                ],
                { cancelable: false }
            );
        } catch (err) {
            Alert.alert("Error", "Something went wrong while posting.");
            // Optional: You can log or handle the error further
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollableContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
            >
                <View style={styles.transWelcomeHeader}>
                    <Text style={styles.transWelcomeText}>Welcome Back</Text>
                    <Text style={styles.transWelcomeSubtext}>
                        Let&apos;s look at your finances
                    </Text>
                </View>

                <View style={styles.transactionCardForm}>
                    <View style={styles.transFieldBlock}>
                        <Text style={styles.transLabel}>Transaction Name</Text>
                        <Controller
                            control={control}
                            rules={{ required: true }}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.transInput}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    placeholder="Enter Transaction Name"
                                    placeholderTextColor="#888"
                                />
                            )}
                        />
                        {errors.name && (
                            <Text style={styles.transErrorText}>Name is required.</Text>
                        )}
                    </View>

                    <View style={styles.transFieldBlock}>
                        <Text style={styles.transLabel}>Transaction Type</Text>
                        <Controller
                            control={control}
                            name="transactionType"
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => (
                                <RadioGroup
                                    radioButtons={transTypeRadio.map(rb => ({
                                        ...rb,
                                        selected: value === rb.value,
                                        labelStyle: {
                                            ...rb.labelStyle,
                                            color: value === rb.value ? '#aad1fa' : '#fff',
                                        }
                                    }))}
                                    onPress={(selectedId: string) => {
                                        const updatedArr = transTypeRadio.map(rb => ({
                                            ...rb,
                                            selected: rb.id === selectedId,
                                        }));
                                        setTransTypeRadio(updatedArr);
                                        const selectedBtn = updatedArr.find(rb => rb.selected);
                                        if (selectedBtn) onChange(selectedBtn.value);
                                    }}
                                    layout="row"
                                />
                            )}
                        />

                        {transactionType === 'spending' && (
                            <Controller
                                name="type"
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.transInput}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        placeholder="Enter Spending Type"
                                        placeholderTextColor="#888"
                                    />
                                )}
                            />
                        )}
                    </View>

                    <View style={styles.transFieldBlock}>
                        <Text style={styles.transLabel}>Amount</Text>
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                pattern: /^\d+(\.\d{1,2})?$/,
                                min: 0.01,
                            }}
                            name="amount"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.transInput}
                                    keyboardType="decimal-pad"
                                    inputMode="decimal"
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={String(value ?? '')}
                                    placeholder="Enter Amount"
                                    placeholderTextColor="#888"
                                />
                            )}
                        />
                        {errors.amount && (
                            <Text style={styles.transErrorText}>Amount is required.</Text>
                        )}
                    </View>

                    <View style={styles.transFieldBlock}>
                        {transactionType === 'spending' && (
                            <View>
                                <Text style={styles.transLabel}>Payment Method</Text>
                                <Controller
                                    control={control}
                                    name="paymentType"
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <RadioGroup
                                            radioButtons={payTypeRadio.map(rb => ({
                                                ...rb,
                                                selected: value === rb.value,
                                                labelStyle: {
                                                    ...rb.labelStyle,
                                                    color: value === rb.value ? '#aad1fa' : '#fff',
                                                }
                                            }))}
                                            onPress={(selectedId: string) => {
                                                const updatedArr = payTypeRadio.map(rb => ({
                                                    ...rb,
                                                    selected: rb.id === selectedId,
                                                }));
                                                setPayTypeRadio(updatedArr);
                                                const selectedBtn = updatedArr.find(rb => rb.selected);
                                                if (selectedBtn) onChange(selectedBtn.value);
                                            }}
                                            layout="row"
                                        />
                                    )}
                                />

                                {paymentType === 'credit' && (
                                    <Controller
                                        name="credited_to"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <View style={styles.transPickerWrapper}>
                                                <RNPickerSelect
                                                    onValueChange={onChange}
                                                    items={credit}
                                                    value={value}
                                                    placeholder={{ label: 'Select Credit Card', value: null }}
                                                    style={pickerStyles}
                                                />
                                            </View>
                                        )}
                                    />
                                )}
                                {paymentType === 'saving' && (
                                    <Controller
                                        name="withdrawn_from"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <View style={styles.transPickerWrapper}>
                                                <RNPickerSelect
                                                    onValueChange={onChange}
                                                    items={saving}
                                                    value={value}
                                                    placeholder={{ label: 'Select Account', value: null }}
                                                    style={pickerStyles}
                                                />
                                            </View>
                                        )}
                                    />
                                )}
                            </View>
                        )}
                        {transactionType === 'transfer' && (
                            <View>
                                <Text style={styles.transLabel}>Withdrawn From</Text>
                                <Controller
                                    name="withdrawn_from"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.transPickerWrapper}>
                                            <RNPickerSelect
                                                onValueChange={onChange}
                                                items={saving}
                                                value={value}
                                                placeholder={{ label: 'Select Account', value: null }}
                                                style={pickerStyles}
                                            />
                                        </View>
                                    )}
                                />

                                <Text style={[styles.transLabel, { marginTop: 7 }]}>
                                    Deposited To
                                </Text>
                                <Controller
                                    name="deposited_to"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.transPickerWrapper}>
                                            <RNPickerSelect
                                                onValueChange={onChange}
                                                items={saving}
                                                value={value}
                                                placeholder={{ label: 'Select Account', value: null }}
                                                style={pickerStyles}
                                            />
                                        </View>
                                    )}
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.transFieldBlock}>
                        <Text style={styles.transLabel}>Transaction Date</Text>
                        <Controller
                            control={control}
                            name="transaction_date"
                            render={({ field: { onChange, value } }) => (
                                <View>
                                    <TouchableOpacity
                                        onPress={() => setShowPicker(true)}
                                        style={styles.transDateButton}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.transDateButtonText}>
                                            {value ? value.toLocaleString() : 'Pick a date'}
                                        </Text>
                                    </TouchableOpacity>
                                    {showPicker && (
                                        <DateTimePicker
                                            value={value || new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setShowPicker(false);
                                                if (event.type === "set" && selectedDate) {
                                                    onChange(selectedDate);
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                            )}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.transSubmitButton}
                        onPress={handleSubmit(onSubmit)}
                    >
                        <Text style={styles.transSubmitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );

}
