import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import RadioGroup from 'react-native-radio-buttons-group';

import { modalStyles, pickerStyles, styles } from '@/styles/global';
import { router } from 'expo-router';
import dataPost from '../../database/dbPost';
import actions from '../actions';
import FormField from '../forms/FormField';

interface IncomeFormFields {
    name: string;
    amount: number;
    type?: string;
    deposited_to: number;
    paid_date: Date;
    expected_date?: number;
    incomeType: "income" | "reccurring_income";
    receivedString: "true" | "false";
}

const IncomeModalForm = ({ visible, onClose, onSuccess, savingOptions }: {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    savingOptions: { label: string; value: any }[];
}) => {
    const {
        control,
        handleSubmit
    } = useForm<IncomeFormFields>({
        defaultValues: {
            paid_date: new Date(),
            incomeType: 'income',
            receivedString: 'false',
            name: '',
            amount: undefined,
            deposited_to: undefined,
        }
    });

    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const incomeType = useWatch({ control, name: 'incomeType' });
    //const receivedString = useWatch({ control, name: 'receivedString' });

    const [incomeTypeRadio, setIncomeTypeRadio] = useState([
        { id: '1', label: 'One-Time', value: 'income', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
        { id: '2', label: 'Recurring', value: 'reccurring_income', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
    ]);
    const [receivedRadio, setReceivedRadio] = useState([
        { id: '1', label: 'Received', value: 'true', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
        { id: '2', label: 'Pending', value: 'false', labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' } },
    ]);

    const onSubmit = async (data: IncomeFormFields) => {
        setLoading(true);
        const receivedBool = data.receivedString === 'true';

        try {
            const { name, type = "Other", amount, deposited_to, paid_date, expected_date } = data;

            if (incomeType === 'income' && paid_date !== undefined) {
                await dataPost.postIncome(name, type, amount, deposited_to, receivedBool, actions.convertDate(paid_date));
            } else if (incomeType === 'reccurring_income' && expected_date !== undefined) {
                await dataPost.postRecIncome(name, type, amount, deposited_to, receivedBool, expected_date);
            }

            if (receivedBool) {
                await dataPost.postDeposit(amount, deposited_to, incomeType, null);
            }

            Alert.alert("Success", "Income posted successfully!", [
                { text: "OK", onPress: () => router.replace('/') }
            ]);
            onSuccess();
        } catch (e) {
            Alert.alert("Error", "Something went wrong while posting.");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={modalStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={modalStyles.menuBox}>
                        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }} keyboardShouldPersistTaps="always">
                            <Text style={styles.formTitle}>
                                Add New Income
                            </Text>

                            <FormField label="Income Type">
                                <Controller
                                    control={control}
                                    name="incomeType"
                                    render={({ field: { onChange, value } }) => (
                                        <RadioGroup
                                            radioButtons={incomeTypeRadio.map(rb => ({
                                                ...rb,
                                                selected: rb.value === value,
                                                labelStyle: { ...rb.labelStyle, color: rb.value === value ? '#aad1fa' : '#fff' }
                                            }))}
                                            onPress={selectedId => {
                                                const updated = incomeTypeRadio.map(rb => ({
                                                    ...rb,
                                                    selected: rb.id === selectedId
                                                }));
                                                setIncomeTypeRadio(updated);
                                                const sel = updated.find(rb => rb.selected);
                                                if (sel) onChange(sel.value);
                                            }}
                                            layout="row"
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="Transaction Name">
                                <Controller
                                    control={control}
                                    name="name"
                                    rules={{ required: 'Name is required' }}
                                    render={({ field }) => (
                                        <TextInput
                                            style={styles.inputField}
                                            onChangeText={field.onChange}
                                            value={field.value}
                                            placeholder="Enter Income Name"
                                            placeholderTextColor="#888"
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="Type">
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <TextInput
                                            style={styles.inputField}
                                            onChangeText={field.onChange}
                                            value={field.value}
                                            placeholder="Enter Income Type"
                                            placeholderTextColor="#888"
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="Amount">
                                <Controller
                                    control={control}
                                    name="amount"
                                    rules={{
                                        required: "Amount is required",
                                        pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Enter a valid amount" },
                                        min: { value: 0.01, message: "Must be more than zero" }
                                    }}
                                    render={({ field }) => (
                                        <TextInput
                                            style={styles.inputField}
                                            keyboardType="decimal-pad"
                                            onChangeText={field.onChange}
                                            value={String(field.value ?? '')}
                                            placeholder="Enter Amount"
                                            placeholderTextColor="#888"
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="Account">
                                <Controller
                                    control={control}
                                    name="deposited_to"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <View style={styles.pickerContainer}>
                                            <RNPickerSelect
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                items={savingOptions}
                                                style={pickerStyles}
                                                placeholder={{ label: "Select Account", value: null }}
                                            />
                                        </View>
                                    )}
                                />
                            </FormField>

                            <FormField label="Received">
                                <Controller
                                    control={control}
                                    name="receivedString"
                                    render={({ field }) => (
                                        <RadioGroup
                                            radioButtons={receivedRadio.map(rb => ({
                                                ...rb,
                                                selected: rb.value === field.value,
                                                labelStyle: { ...rb.labelStyle, color: rb.value === field.value ? '#aad1fa' : '#fff' }
                                            }))}
                                            onPress={selectedId => {
                                                const updated = receivedRadio.map(rb => ({
                                                    ...rb, selected: rb.id === selectedId
                                                }));
                                                setReceivedRadio(updated);
                                                const sel = updated.find(rb => rb.selected);
                                                if (sel) field.onChange(sel.value);
                                            }}
                                            layout="row"
                                        />
                                    )}
                                />
                            </FormField>

                            {incomeType === 'income' ? (
                                <FormField label="Expected Date">
                                    <Controller
                                        control={control}
                                        name="paid_date"
                                        render={({ field }) => (
                                            <View>
                                                <TouchableOpacity
                                                    style={styles.dateButton}
                                                    onPress={() => setShowPicker(true)}
                                                >
                                                    <Text style={styles.dateButtonText}>
                                                        {field.value ? new Date(field.value).toLocaleDateString() : 'Pick a date'}
                                                    </Text>
                                                </TouchableOpacity>
                                                {showPicker && (
                                                    <DateTimePicker
                                                        value={field.value ? new Date(field.value) : new Date()}
                                                        mode="date"
                                                        display="default"
                                                        onChange={(e, selectedDate) => {
                                                            setShowPicker(false);
                                                            if (e.type === 'set' && selectedDate) {
                                                                field.onChange(selectedDate);
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
                                        name="expected_date"
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <View style={styles.pickerContainer}>
                                                <RNPickerSelect
                                                    onValueChange={field.onChange}
                                                    items={Array.from({ length: 30 }, (_, i) => ({
                                                        label: String(i + 1),
                                                        value: i + 1
                                                    }))}
                                                    value={field.value}
                                                    placeholder={{ label: 'Choose a Day', value: null }}
                                                    style={pickerStyles}
                                                />
                                            </View>
                                        )}
                                    />
                                </FormField>
                            )}

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit(onSubmit)}
                            >
                                <Text style={styles.submitButtonText}>
                                    {loading ? 'Submitting...' : 'Submit'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

export default IncomeModalForm;