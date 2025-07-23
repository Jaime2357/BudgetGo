import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';

import dataPost from "@/app/database/dbPost";
import { pickerStyles, styles } from "@/styles/global";
import { RecExpenses } from "@/types/typeDefs";
import actions from "../actions";
import FormField from "../forms/FormField";

interface DefaultRecProps {
    record: RecExpenses;
    onSuccess: () => void;
    creditOptions: { label: string; value: any }[]
}

const ModRecModal: React.FC<DefaultRecProps> = ({ record, onSuccess, creditOptions }) => {

    const [loading, setLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const { control, handleSubmit } = useForm<{
        name: string,
        amount: number,
        type: string,
        date: Date,
        credited_to: number,
        saveReccurring: boolean
    }>({
        defaultValues: {
            name: record.name,
            amount: record.amount,
            type: record.type,
            date: new Date(actions.getFullDate(record.reccurring_date)),
            credited_to: record.credited_to,
            saveReccurring: false
        }
    });

    async function onSubmit(data: {
        name: string
        amount: number,
        type: string,
        date: Date,
        credited_to: number,
        saveReccurring: boolean
    }) {

        const { name, amount, type, date, credited_to, saveReccurring } = data

        try {

            await dataPost.logRecSpend(
                record.id, name, type,
                Number(amount), credited_to, actions.convertDate(date))

            if (saveReccurring) {
                let newDate = new Date(date);
                let recDay = newDate.getDate()
                await dataPost.updateRecSpend(record.id, name, type, amount, credited_to, recDay)
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

            <FormField label="Credit Card">
                <Controller
                    control={control}
                    name="credited_to"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <View style={styles.pickerContainer}>
                            <RNPickerSelect
                                onValueChange={field.onChange}
                                value={field.value}
                                items={creditOptions}
                                style={pickerStyles}
                                placeholder={{ label: "Select Account", value: null }}
                            />
                        </View>
                    )}
                />
            </FormField>

            <FormField label="">
                <Controller
                    control={control}
                    name="saveReccurring"
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

export default ModRecModal;