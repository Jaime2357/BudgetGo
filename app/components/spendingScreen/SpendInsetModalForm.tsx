import { modalStyles, styles } from '@/styles/global';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import dataPost from '../../database/dbPost';
import actions from '../actions';

import { PickerItem } from '@/types/typeDefs';
import FormAmountField from '../forms/FormAmountField';
import FormDateField from '../forms/FormDateField';
import FormInputField from '../forms/FormInputField';
import FormPickerField from '../forms/FormPickerField';
import FormRadioGroup from '../forms/FormRadioGroup';

interface SpendFormFields {
    name: string;
    amount: number;
    type: string | null;
    credited_to: number | null;
    withdrawn_from: number | null;
    payment_date: Date;
    reccurring_date?: number;
    spendType: 'planned' | 'reccurring';
    payType: 'credit' | 'account'
}

const SpendInsertModalForm = ({
    visible,
    onClose,
    onSuccess,
    savingOptions,
    creditOptions
}: {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    savingOptions: PickerItem[];
    creditOptions: PickerItem[]
}) => {

    const {
        control,
        handleSubmit,
        setValue
    } = useForm<SpendFormFields>({
        defaultValues: {
            name: '',
            amount: 0,
            type: null,
            credited_to: null,
            withdrawn_from: null,
            payment_date: new Date(),
            spendType: 'planned',
            payType: 'credit',
            reccurring_date: 1,
        },
    });

    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const spendType = useWatch({ control, name: 'spendType' });
    const payType = useWatch({ control, name: 'payType' });

    useEffect(() => {
        if (spendType === "reccurring") {
            setValue('payType', 'credit');
        }
    }, [spendType])

    const [spendTypeRadio, setSpendTypeRadio] = useState([
        {
            id: '1',
            label: 'Planned',
            value: 'planned',
            labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
        {
            id: '2',
            label: 'Recurring',
            value: 'reccurring',
            labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
    ]);

    const [payTypeRadio, setPayTypeRadio] = useState([
        {
            id: '1',
            label: 'Credit Card',
            value: 'credit',
            labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
        {
            id: '2',
            label: 'Account',
            value: 'account',
            labelStyle: { fontSize: 16, fontFamily: 'Tektur-Sub' },
        },
    ]);

    const onSubmit = async (data: SpendFormFields) => {
        setLoading(true);

        try {

            if(payType === 'credit'){
                setValue('withdrawn_from', null)
            }
            else{
                setValue('credited_to', null)
            }
            
            const { name, amount, credited_to, withdrawn_from, type, payment_date, reccurring_date } = data;

            console.log(name, amount, credited_to, withdrawn_from, type, payment_date, reccurring_date, spendType)

            if (spendType === 'planned') {
                await dataPost.postPlannedExpense(name, type, amount, actions.convertDate(payment_date), credited_to, withdrawn_from);
            } else if (spendType === 'reccurring' && reccurring_date !== undefined && credited_to != null) {
                console.log('reached')
                await dataPost.postRecExpense(name, type, amount, credited_to, reccurring_date);
            }

            Alert.alert('Success', 'Future Spend posted successfully!', [
                { text: 'OK', onPress: () => router.replace('/') },
            ]);
            onSuccess();
        } catch (e) {
            Alert.alert('Error', 'Something went wrong while posting.');
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
                            <Text style={styles.formTitle}>New Spending</Text>

                            <FormRadioGroup
                                control={control}
                                name="spendType"
                                label="Future Transaction Type"
                                radioButtons={spendTypeRadio}
                                setRadioButtons={setSpendTypeRadio}
                            />

                            <FormInputField control={control} name="name" label="Transaction Name" placeholder="Enter Transaction Name" />
                            <FormInputField control={control} name="type" label="Type" placeholder="Enter Transaction Type" />
                            <FormAmountField control={control} name="amount" />

                            {spendType === 'planned' && (
                                <FormRadioGroup
                                    control={control}
                                    name="payType"
                                    label="Payment Method"
                                    radioButtons={payTypeRadio}
                                    setRadioButtons={setPayTypeRadio}
                                />)}

                            {payType === 'account' ? (
                                <FormPickerField control={control} name="withdrawn_from" label="Account" items={savingOptions} />
                            ) : (
                                <FormPickerField control={control} name="credited_to" label="Credit Card" items={creditOptions} />
                            )
                            }

                            {spendType === 'planned' ? (
                                <FormDateField
                                    control={control}
                                    name="payment_date"
                                    showPicker={showPicker}
                                    setShowPicker={setShowPicker}
                                />
                            ) : (
                                <FormPickerField
                                    control={control}
                                    name="reccurring_date"
                                    label="Recurring Date"
                                    items={Array.from({ length: 30 }, (_, i) => ({
                                        label: String(i + 1),
                                        value: i + 1,
                                    }))}
                                />
                            )}

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                                <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

export default SpendInsertModalForm;
