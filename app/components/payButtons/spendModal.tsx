import React from "react";
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import { modalStyles, styles } from "@/styles/global";
import { CreditAccount, PlanExpenses, SavingAccount } from "@/types/typeDefs";
import FormField from "../forms/FormField";
import DefaultPayModal from "./defaultPayModal";
import ModPayModal from "./modPayModal";

interface PayRecProps {
    record: PlanExpenses;
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    savingOptions: { label: string; value: any }[]
    creditOptions: { label: string; value: any }[]
    savingMap: Map<number, SavingAccount>
    creditMap: Map<number, CreditAccount>
}

const PaySingle: React.FC<PayRecProps> = ({ 
    record, 
    visible, 
    onClose, 
    onSuccess, 
    savingOptions, 
    creditOptions, 
    savingMap, 
    creditMap 
}) => {

    const { control } = useForm<{ modRec: boolean }>({ defaultValues: { modRec: false } });

    const modRec = useWatch({ control, name: "modRec" });


    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={modalStyles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >

                <TouchableWithoutFeedback>
                    <View style={modalStyles.menuBox}>
                        <ScrollView
                            contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
                            keyboardShouldPersistTaps="always"
                            showsVerticalScrollIndicator={false}
                        >

                            <Text style={styles.transTitle}>
                                Planned Payment: {record.name}
                            </Text>

                            <FormField label="">
                                <Controller
                                    control={control}
                                    name="modRec"
                                    render={({ field: { onChange, value } }) => (
                                        <TouchableOpacity
                                            onPress={() => onChange(!value)}
                                            activeOpacity={0.8}
                                            style={styles.checkbox}
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
                                                Edit Details
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </FormField>

                            {modRec ? (
                                <ModPayModal
                                    record={record}
                                    onSuccess={onSuccess}
                                    savingOptions={savingOptions}
                                    creditOptions={creditOptions}
                                />
                            ) : (
                                <DefaultPayModal
                                    record={record}
                                    onSuccess={onSuccess}
                                    savingMap={savingMap}
                                    creditMap={creditMap}
                                />
                            )}

                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default PaySingle