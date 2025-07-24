import { router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import dataPost from "@/app/database/dbPost";
import FormAmountField from "../forms/FormAmountField";
import FormImagePickerComponent from "../forms/FormImagePicker";
import FormInputField from "../forms/FormInputField";

import { modalStyles, styles } from "@/styles/global";

const NewCardModal = ({
    accountType,
    visible,
    onClose,
    onSuccess
}: {
    accountType: 'credit' | 'account';
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) => {

    const {
        control,
        handleSubmit
    } = useForm<{ name: string, amount: number }>({
        defaultValues: {
            name: '',
            amount: 0
        },
    });

    const [imageUri, setImageUri] = useState<string | null>(null)

    const handleImagePicked = (uri: string | null) => {
        setImageUri(uri);
    };

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: { name: string, amount: number }) => {

        const { name, amount } = data;

        try {

            if (accountType === 'credit') {
                await dataPost.addNewCredit(name, amount, imageUri)
                Alert.alert('Success', 'Credit Card added successfully!', [
                    { text: 'OK', onPress: () => router.replace('/') },
                ]);
            }
            else {
                await dataPost.addNewAccount(name, amount, imageUri)
                Alert.alert('Success', 'Account Balance added successfully!', [
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

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={modalStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={modalStyles.menuBox}>
                        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }} keyboardShouldPersistTaps="always">
                            {accountType === 'credit' ? (
                                <View>
                                    <Text style={styles.formTitle}>New Credit Card</Text>
                                    <FormInputField control={control} name="name" label="Card Name" placeholder="Enter Credit Card Name" />
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.formTitle}>New Account Balance</Text>
                                    <FormInputField control={control} name="name" label="Account Name" placeholder="Enter Account Name" />
                                </View>
                            )}

                            <FormAmountField control={control} name="amount" label="Balance" />

                            <FormImagePickerComponent
                                imageUri={imageUri}
                                onImagePicked={handleImagePicked}
                                label="Select Card Image (Optional)"
                            />

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                                <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default NewCardModal;