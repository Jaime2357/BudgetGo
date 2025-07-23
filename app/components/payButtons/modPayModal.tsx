import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import RadioGroup from 'react-native-radio-buttons-group';

import dataPost from "@/app/database/dbPost";
import { pickerStyles, styles } from "@/styles/global";
import { PlanExpenses } from "@/types/typeDefs";
import actions from "../actions";
import FormField from "../forms/FormField";

interface DefaultRecProps {
    record: PlanExpenses;
    onSuccess: () => void;
    savingOptions: { label: string; value: any }[];
    creditOptions: { label: string; value: any }[];
}

const ModPayModal: React.FC<DefaultRecProps> = ({ record, onSuccess, savingOptions, creditOptions }) => {

    const [loading, setLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const { control, handleSubmit } = useForm<{
        name: string,
        amount: number,
        type: string,
        date: Date,
        credited_to: number | null,
        withdrawn_from: number | null
        savePlanned: boolean,
        paymentType: string
    }>({
        defaultValues: {
            name: record.name,
            amount: record.amount,
            type: record.type,
            date: record.paid_date,
            credited_to: record.credited_to,
            withdrawn_from: record.withdrawn_from,
            savePlanned: false,
            paymentType: 'credit'
        }
    });

    const watchPaymentType = useWatch({ control, name: 'paymentType' });
    const [payTypeRadio, setPayTypeRadio] = useState([
        {
            id: '1', label: 'Credit Card', value: 'credit', selected: false,
            labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub', maxWidth: 80},
        },
        {
            id: '2', label: 'Account Balance', value: 'saving', selected: false,
            labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub', maxWidth: 80},
        },
    ]);

    async function onSubmit(data: {
        name: string
        amount: number,
        type: string,
        date: Date,
        credited_to: number | null,
        withdrawn_from: number | null
        savePlanned: boolean,
        paymentType: string
    }) {

        const { name, amount, type, date, credited_to, withdrawn_from, savePlanned } = data

        let withdrawnFrom = withdrawn_from;
        let creditedTo = credited_to;

        if (watchPaymentType === 'credit') {
            withdrawnFrom = null
        }
        else {
            creditedTo = null
        }

        try {

            await dataPost.logPlanSpend(
                record.id, name, type,
                Number(amount), creditedTo, withdrawnFrom, actions.convertDate(date))

            if (savePlanned) {
                await dataPost.updatePlanSpend(
                    record.id,
                    name, type,
                    amount,
                    credited_to,
                    withdrawn_from,
                    actions.convertDate(date)
                )
            }

            Alert.alert(
                "Success",
                "Monthly Spend Successfully Posted", [
                { text: "OK", onPress: () => onSuccess() }
            ]);
        } catch (err) {
            Alert.alert("Error", "Something went wrong while posting.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            < FormField label="Name" >
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.inputField}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            placeholder="Name"
                            placeholderTextColor="#888"
                        />
                    )}
                />
            </FormField >

            < FormField label="Amount" >
                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.inputField}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={String(value ?? '')}
                            placeholder="Amount"
                            placeholderTextColor="#888"
                        />
                    )}
                />
            </FormField >

            < FormField label="Type" >
                <Controller
                    control={control}
                    name="type"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.inputField}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            placeholder="Type"
                            placeholderTextColor="#888"
                        />
                    )}
                />
            </FormField >

            <FormField label="Expected Date">
                <Controller
                    control={control}
                    name="date"
                    render={({ field: { onChange, value } }) => (
                        <View>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowPicker(true)}
                            >
                                <Text style={styles.dateButtonText}>
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

            {/* Payment Method Field */}
            <FormField label="Payment Method">
                <Controller
                    control={control}
                    name="paymentType"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', width: '90%' }}>
                            <RadioGroup
                                radioButtons={payTypeRadio.map(rb => ({
                                    ...rb,
                                    selected: value === rb.value,
                                    labelStyle: {
                                        ...rb.labelStyle,
                                        color: value === rb.value ? '#aad1fa' : '#fff',
                                    },
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
                        </View>
                    )}
                />
            </FormField>

            {/* Conditional: Credit Card Picker */}
            {watchPaymentType === 'credit' && (
                <FormField label="Select Credit Card">
                    <Controller
                        name="credited_to"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={onChange}
                                    value={value}
                                    items={creditOptions}
                                    placeholder={{ label: 'Select Credit Card', value: null }}
                                    style={pickerStyles}
                                />
                            </View>
                        )}
                    />
                </FormField>
            )}

            {/* Conditional: Saving Account Picker */}
            {watchPaymentType === 'saving' && (
                <FormField label="Select Savings Account">
                    <Controller
                        name="withdrawn_from"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={onChange}
                                    value={value}
                                    items={savingOptions}
                                    placeholder={{ label: 'Select Account', value: null }}
                                    style={pickerStyles}
                                />
                            </View>
                        )}
                    />
                </FormField>
            )}


            <FormField label="">
                <Controller
                    control={control}
                    name="savePlanned"
                    render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                            onPress={() => onChange(!value)}
                            activeOpacity={0.8}
                            style={styles.checkboxRow}
                        >
                            <View
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderWidth: 2,
                                    borderColor: value ? '#aad1fa' : '#888',
                                    backgroundColor: value ? '#aad1fa' : 'transparent',
                                    marginRight: 12,
                                    borderRadius: 4,
                                }}
                            />
                            <Text
                                style={{
                                    color: value ? '#aad1fa' : '#fff',
                                    fontSize: 15,
                                    fontFamily: 'Tektur-Sub',
                                }}
                            >
                                Update Recurring Payment Details
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </FormField>



            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>
                    {loading ? 'Submitting...' : 'Submit'}
                </Text>
            </TouchableOpacity>
        </>
    )
}

export default ModPayModal;