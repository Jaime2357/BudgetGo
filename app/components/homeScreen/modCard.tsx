import { router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import dataDrop from "@/app/database/dbDrop";
import dataPost from "@/app/database/dbPost";
import FormAmountField from "../forms/FormAmountField";
import FormImagePickerComponent from "../forms/FormImagePicker";
import FormInputField from "../forms/FormInputField";

import { modalStyles, styles } from "@/styles/global";
import { CreditAccount, SavingAccount } from "@/types/typeDefs";

interface ModCardFormProp {
    name: string,
    amount: number,
    control_value: number,
    modified_value: number,
}

const ModCardModal = ({
    account,
    accountType,
    visible,
    onClose,
    onSuccess
}: {
    account: SavingAccount | CreditAccount
    accountType: 'credit' | 'savings';
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) => {

    const defaultValues = getDefaultValues(account, accountType);

    const {
        control,
        handleSubmit
    } = useForm<ModCardFormProp>({
        defaultValues,
    });

    const [imageUri, setImageUri] = useState<string | null>(account.image_uri)

    const handleImagePicked = (uri: string | null) => {
        setImageUri(uri);
    };

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: ModCardFormProp) => {

        console.log('reached')

        const { name, amount, control_value, modified_value } = data;

        try {

            if (accountType === 'credit') {
                await dataPost.updateCreditAccount(account.id, name, amount, modified_value, imageUri)
                Alert.alert('Success', 'Credit Card updated successfully!', [
                    { text: 'OK', onPress: () => router.replace('/') },
                ]);
            }
            else {
                await dataPost.updateSavingAccount(account.id, name, amount, control_value, modified_value, imageUri)
                Alert.alert('Success', 'Account Balance updated successfully!', [
                    { text: 'OK', onPress: () => router.replace('/') },
                ]);
            }

            onSuccess();
        } catch (e) {
            Alert.alert('Error', 'Something went wrong while posting.');
        } finally {
            setLoading(false);
            onClose();
        }
    }

    const onDelete = async () => {

        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        // Optional: do nothing or log cancel
                    },
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);

                        try {
                            if (accountType === 'credit') {
                                await dataDrop.dropCredit(account.id);
                                Alert.alert('Success', 'Credit Card deleted successfully!', [
                                    { text: 'OK', onPress: () => router.replace('/') },
                                ]);
                            }
                            else {
                                await dataDrop.dropAccount(account.id)
                                Alert.alert('Success', 'Account deleted successfully!', [
                                    { text: 'OK', onPress: () => router.replace('/') },
                                ]);
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Something went wrong while deleting.');
                        } finally {
                            setLoading(false);
                            onClose();
                        }
                    },
                },
            ],
            { cancelable: false } // User must tap a button explicitly
        );
    };

    function getDefaultValues(
        account: SavingAccount | CreditAccount,    // Replace `any` with a more specific type if you like
        accountType: 'savings' | 'credit'
    ) {
        if (accountType === 'savings' && isSavingAccount(account)) {
            return {
                name: account.name,
                amount: account.balance,
                control_value: account.threshold,
                modified_value: account.modifications ? account.modifications : 0,
            };
        } else if (accountType === 'credit' && !isSavingAccount(account)) {
            return {
                name: account.name,
                amount: account.current_balance,
                modified_value: account.pending_charges ? account.pending_charges : 0,
            };
        }
        return {} as any;
    }

    function isSavingAccount(account: SavingAccount | CreditAccount): account is SavingAccount {
        return (account as SavingAccount).balance !== undefined;
    }



    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={modalStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={modalStyles.menuBox}>
                        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }} keyboardShouldPersistTaps="always">
                            {accountType === 'credit' ? (
                                <View>
                                    <Text style={styles.formTitle}>Edit Credit Card</Text>
                                    <FormInputField control={control} name="name" label="Card Name" placeholder="Enter Credit Card Name" />
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.formTitle}>Edit Account Balance</Text>
                                    <FormInputField control={control} name="name" label="Account Name" placeholder="Enter Account Name" />
                                </View>
                            )}

                            <FormAmountField control={control} name="amount" label="Balance" />

                            {accountType === 'credit' ? (
                                <View>
                                    <FormAmountField control={control} name="modified_value" label="Pending Charges" />
                                </View>
                            ) : (
                                <View>
                                    <FormAmountField control={control} name="control_value" label="Goal" />
                                    <FormAmountField control={control} name="modified_value" label="Modifications" />
                                </View>
                            )}

                            <FormImagePickerComponent
                                imageUri={imageUri}
                                onImagePicked={handleImagePicked}
                                label="Select Card Image"
                            />

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit, (errors) => {
                                console.log('Validation errors:', errors);
                            })}>
                                <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                                <Text style={styles.deleteButtonText}>{loading ? 'Deleting...' : 'Delete'}</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default ModCardModal;