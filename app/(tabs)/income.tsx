import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
    Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import RadioGroup from 'react-native-radio-buttons-group';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickerStyles, styles } from '@/styles/global';
import { Income, RecIncome, SavingAccount } from '@/types/typeDefs';
import initDB from '../database/dbInit';
import dataPost from '../database/dbPost';
import dataRequest from '../database/dbReq';

type PickerItem = { label: string; value: number | string };
type RadioButtonType = {
    id: string;
    label: string;
    value: string;
    selected?: boolean;
    labelStyle?: any;
};

interface IncomeLike {
    id: number | string;
    name: string;
    amount: number;
    type: string;
    deposited_to: number;
    paid_date?: Date | string;
    expected_date?: number | string;
    received: boolean;
}

type IncomeSectionProps = {
    title: string;
    data: IncomeLike[];
    getSavingName: (id?: number | null) => string;
    getReadableDate: (date: Date | string) => string;
    recurring?: boolean;
};

interface IncomeFormFields {
    name: string;
    amount: number;
    type?: string;
    deposited_to: number;
    paid_date: Date;
    expected_date?: number;
    incomeType: 'income' | 'reccurring_income';
    receivedString: 'true' | 'false';
}

export default function IncomeScreen() {
    // Data & modal states
    const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
    const [savingNames, setSavingNames] = useState<PickerItem[]>([]);
    const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [allIncome, setAllIncome] = useState<Income[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // Form setup
    const { control,
        handleSubmit,
        formState: { errors }
    } = useForm<IncomeFormFields>({
        defaultValues: {
            paid_date: new Date(),
            incomeType: 'income',
            receivedString: 'false',
            amount: undefined,
            deposited_to: undefined,
            name: '',
        }
    });

    const incomeType = useWatch({ control, name: 'incomeType' });
    const receivedString = useWatch({ control, name: 'receivedString' });
    const [loading, setLoading] = useState(false);

    const [incomeTypeRadio, setIncomeTypeRadio] = useState<RadioButtonType[]>([
        { id: '1', label: 'One-Time', value: 'income', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
        { id: '2', label: 'Recurring', value: 'reccurring_income', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
    ]);
    const [receivedRadio, setReceivedRadio] = useState<RadioButtonType[]>([
        { id: '1', label: 'Received', value: 'true', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
        { id: '2', label: 'Pending', value: 'false', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
    ]);

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

    async function onSubmit(data: IncomeFormFields) {
        setLoading(true);

        let receivedBool;

        if (receivedString === 'true') {
            receivedBool = true;
        }
        else {
            receivedBool = false;
        }
        try {
            let {
                name,
                type,
                amount,
                deposited_to,
                paid_date,
                expected_date
            } = data;

            if (type === undefined) {
                type = "Other";
            }

            if (incomeType === 'income' && paid_date != undefined) {
                await dataPost.postIncome(name, type, amount, deposited_to, receivedBool, convertDate(paid_date));

            } else if (incomeType === 'reccurring_income' && expected_date != undefined) {
                await dataPost.postRecIncome(name, type, amount, deposited_to, receivedBool, expected_date);
            }

            if (receivedBool === true) {
                await dataPost.postDeposit(amount, deposited_to, incomeType, null)
            }

            // Show success alert
            Alert.alert(
                "Success",
                "Income posted successfully!",
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
            setMenuOpen(false);
            setLoading(false);
        }
    }

    // Data fetching
    useFocusEffect(useCallback(() => { setupAndFetch(); }, []));
    const setupAndFetch = async () => {
        await initDB();
        const recIncome = await dataRequest.getAllRecIncome();
        const income = await dataRequest.getIncome();
        const allIncome = await dataRequest.getAllIncome();
        const savings = await dataRequest.getSaving();
        setSaving(new Map(savings.map(s => [s.id, s])));
        setSavingNames(savings.map(a => ({ label: a.name, value: a.id })));
        setRecIncome(recIncome);
        setIncome(income);
        setAllIncome(allIncome);
        setMenuOpen(false);
    };
    const onRefresh = async () => {
        setRefreshing(true);
        setMenuOpen(false);
        await setupAndFetch();
        setRefreshing(false);
    };

    // Render helpers
    const getReadableDate = (date: string | Date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    };

    const getSavingName = (id?: number | null) => id ? saving.get(id)?.name ?? '' : '';

    // --- Modal Form Section ---
    function IncomeModalForm() {
        return (
            <Modal
                visible={menuOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuOpen(false)}
            >
                <TouchableOpacity
                    style={modalStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuOpen(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={modalStyles.menuBox}>
                            <ScrollView
                                contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
                                keyboardShouldPersistTaps="always"
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontSize: 19,
                                    fontWeight: '700',
                                    marginBottom: 18,
                                    fontFamily: 'Tektur-Sub'
                                }}>
                                    Add New Income
                                </Text>
                                <View style={{ width: '100%' }}>
                                    {/* Income Type Radio */}
                                    <Controller
                                        control={control}
                                        name="incomeType"
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <RadioGroup
                                                radioButtons={incomeTypeRadio.map(rb => ({
                                                    ...rb,
                                                    selected: value === rb.value,
                                                    labelStyle: {
                                                        ...rb.labelStyle,
                                                        color: value === rb.value ? '#aad1fa' : '#fff'
                                                    }
                                                }))}
                                                onPress={selectedId => {
                                                    const updated = incomeTypeRadio.map(rb => ({
                                                        ...rb, selected: rb.id === selectedId
                                                    }));
                                                    setIncomeTypeRadio(updated);
                                                    const btn = updated.find(rb => rb.selected);
                                                    if (btn) onChange(btn.value);
                                                }}
                                                layout="row"
                                            />
                                        )}
                                    />
                                </View>

                                {/* Transaction Name */}
                                <FormField
                                    label="Transaction Name"
                                //error={errors.name?.message}
                                >
                                    <Controller
                                        control={control}
                                        rules={{ required: 'Name is required' }}
                                        name="name"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={styles.transInput}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder="Enter Income Name"
                                                placeholderTextColor="#888"
                                            />
                                        )}
                                    />
                                </FormField>

                                {/* Income Type */}
                                <FormField label="Income Type">
                                    <Controller
                                        control={control}
                                        name="type"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={styles.transInput}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                placeholder="Enter Income Type"
                                                placeholderTextColor="#888"
                                            />
                                        )}
                                    />
                                </FormField>

                                {/* Amount */}
                                <FormField label="Amount">
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: 'Amount is required',
                                            pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Enter a valid amount' },
                                            min: { value: 0.01, message: 'Must be more than zero' },
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
                                    {/* {errors.amount && (
                <Text style={styles.transErrorText}>{errors.amount.message}</Text>
              )} */}
                                </FormField>

                                {/* Account */}
                                <FormField label="Account">
                                    <Controller
                                        name="deposited_to"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <View style={styles.transPickerWrapper}>
                                                <RNPickerSelect
                                                    onValueChange={onChange}
                                                    items={savingNames}
                                                    value={value}
                                                    placeholder={{ label: 'Select Account', value: null }}
                                                    style={pickerStyles}
                                                />
                                            </View>
                                        )}
                                    />
                                </FormField>

                                {/* Received Radio */}
                                <View>
                                    <Controller
                                        control={control}
                                        name="receivedString"
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <RadioGroup
                                                radioButtons={receivedRadio.map(rb => ({
                                                    ...rb,
                                                    selected: value === rb.value,
                                                    labelStyle: {
                                                        ...rb.labelStyle,
                                                        color: value === rb.value ? '#aad1fa' : '#fff'
                                                    }
                                                }))}
                                                onPress={selectedId => {
                                                    const updated = receivedRadio.map(rb => ({
                                                        ...rb, selected: rb.id === selectedId
                                                    }));
                                                    setReceivedRadio(updated);
                                                    const btn = updated.find(rb => rb.selected);
                                                    if (btn) onChange(btn.value);
                                                }}
                                                layout="row"
                                            />
                                        )}
                                    />
                                </View>

                                {/* Date/Recurring Field */}
                                {incomeType === 'income' ? (
                                    <FormField label="Expected Date">
                                        <Controller
                                            control={control}
                                            name="paid_date"
                                            render={({ field: { onChange, value } }) => (
                                                <View>
                                                    <TouchableOpacity
                                                        style={styles.transDateButton}
                                                        onPress={() => setShowPicker(true)}
                                                    >
                                                        <Text style={styles.transDateButtonText}>
                                                            {value ? new Date(value).toLocaleString() : 'Pick a date'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    {showPicker && (
                                                        <DateTimePicker
                                                            value={value ? new Date(value) : new Date()}
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

                                    </FormField>
                                ) : (
                                    <FormField label="Recurring Date">
                                        <Controller
                                            control={control}
                                            name="amount"
                                            rules={{ required: true }}
                                            render={({ field: { onChange, value } }) => (
                                                <View style={styles.transPickerWrapper}>
                                                    <RNPickerSelect
                                                        onValueChange={onChange}
                                                        items={Array.from({ length: 30 }, (_, i) => ({ label: String(i + 1), value: i + 1 }))}
                                                        value={value}
                                                        placeholder={{ label: 'Chose a Date', value: null }}
                                                        style={pickerStyles}
                                                    />
                                                </View>
                                            )}
                                        />
                                    </FormField>
                                )}
                                <TouchableOpacity
                                    style={styles.transSubmitButton}
                                    onPress={handleSubmit(onSubmit)}
                                >
                                    <Text style={styles.transSubmitButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        );
    }

    // --- Form Field Wrapper ---
    function FormField({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) {
        return (
            <View style={[styles.transFieldBlock, { marginBottom: 12 }]}>
                <Text style={styles.transLabel}>{label}</Text>
                {children}
                {error ? <Text style={styles.transErrorText}>{error}</Text> : null}
            </View>
        );
    }

    // --- Main Render ---
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollableContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
            >
                <View style={styles.welcomeHeader}>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtext}>
                        Let&apos;s look at your finances
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <IncomeSection title="Income" data={allIncome} getSavingName={getSavingName} getReadableDate={getReadableDate} />
                    <IncomeSection title="Recurring Income" data={recIncome} getSavingName={getSavingName} getReadableDate={getReadableDate} recurring />
                    <IncomeSection title="Pending Income" data={income} getSavingName={getSavingName} getReadableDate={getReadableDate} />
                </View>
            </ScrollView>

            <TouchableOpacity
                style={modalStyles.fabStyle}
                onPress={() => setMenuOpen(true)}
                activeOpacity={0.8}
            >
                <Text style={{ fontSize: 32, color: '#fff', fontWeight: 'bold' }}>＋</Text>
            </TouchableOpacity>
            <IncomeModalForm />
        </SafeAreaView>
    );
}

// --- Modular Section Table (for compartmentalization) ---
function IncomeSection({ title, data, getSavingName, getReadableDate, recurring = false }: IncomeSectionProps) {

    async function handleLogClick(amount: number, deposited_to: number, type: string, id: number) {
        await dataPost.postDeposit(amount, deposited_to, type, id)

        Alert.alert(
            "Success",
            "Income posted successfully!",
            [
                {
                    text: "OK",
                    onPress: () => router.replace('/'), // Navigate after OK
                },
            ],
            { cancelable: false }
        );

    }

    return (
        <View style={styles.islandTable}>
            {data.length === 0 ? (
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>No {title}</Text>
                </View>
            ) : (
                <View>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>{title}</Text>
                    </View>
                    <ScrollView
                        nestedScrollEnabled
                        contentContainerStyle={{ paddingBottom: 40 }}
                        style={{ flexGrow: 1 }}
                    >
                        {data.map((item, idx) => (
                            <View key={item.id ?? idx} style={styles.cardTableRow}>
                                <View style={{ flexDirection: 'column', width: '50%' }}>
                                    <Text style={styles.cardRowTextLeft}>{item.name}:</Text>
                                    <Text style={styles.cardRowTextLeft}>
                                        ${item.amount}{item.type ? ` (${item.type})` : ''}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'column', width: '50%' }}>
                                    {recurring && item.expected_date ?
                                        <Text style={styles.cardRowTextRight}>
                                            {item.expected_date}th
                                        </Text>
                                        : (
                                            <Text style={styles.cardRowTextRight}>
                                                {getSavingName(item.deposited_to)}
                                            </Text>
                                        )
                                    }
                                    {item.received ? (
                                        <Text style={styles.cardRowTextRight}>
                                            {item.paid_date ? getReadableDate(item.paid_date) : ''}
                                        </Text>
                                    ) : (
                                        !recurring && item.expected_date ? (
                                            <TouchableOpacity
                                                style={styles.tablePayButton}
                                                onPress={() => handleLogClick(item.amount, item.deposited_to, 'income', Number(item.id))}>
                                                <Text style={styles.tablePayButtonText}>Log</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.tablePayButton}
                                                onPress={() => handleLogClick(item.amount, item.deposited_to, 'reccurring_income', Number(item.id))}>
                                                <Text style={styles.tablePayButtonText}>Log</Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const modalStyles = StyleSheet.create({
    fabStyle: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        backgroundColor: '#5294ec',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        zIndex: 99,
    },
    menuBox: {
        backgroundColor: '#232323',
        borderRadius: 18,
        padding: 28,
        width: 340,
        maxWidth: '94%',
        maxHeight: 500,        // or tweak as desired
        shadowColor: '#222',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',  // Dims the background
        justifyContent: 'center',
        alignItems: 'center',
    },

});
