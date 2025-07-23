import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import dataPost from "@/app/database/dbPost";
import { styles } from "@/styles/global";
import { CreditAccount, PlanExpenses, SavingAccount } from "@/types/typeDefs";
import actions, { getCreditName, getSavingName } from "../actions";

interface DefaultRecProps {
    record: PlanExpenses;
    onSuccess: () => void;
    savingMap: Map<number, SavingAccount>
    creditMap: Map<number, CreditAccount>
}

const DefaultPayModal: React.FC<DefaultRecProps> = ({ record, onSuccess, savingMap, creditMap }) => {

    const [loading, setLoading] = useState(false);

    async function onSimpleSubmit() {

        try {

            await dataPost.logPlanSpend(
                record.id, record.name, record.type,
                record.amount, record.credited_to, record.withdrawn_from, String(record.paid_date))

            Alert.alert(
                "Success",
                "Play Spend Successfully Logged", [
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
            <Text style={styles.formSubtitle}>
                Is the following information correct:
            </Text>

            <View>
                <Text style={styles.formLabel}>
                    Amount:
                </Text>
                <Text style={styles.inputFieldNoBorder}>
                    ${record.amount}
                </Text>
            </View>

            <View>
                <Text style={styles.formLabel}>
                    Type:
                </Text>

                <Text style={styles.inputFieldNoBorder}>
                    {record.type}
                </Text>
            </View>

            <View>
                <Text style={styles.formLabel}>
                    Date:
                </Text>

                <Text style={styles.inputFieldNoBorder}>
                    {actions.getReadableDate(record.paid_date)}
                </Text>
            </View>

            <View>
                <Text style={styles.formLabel}>
                    {record.withdrawn_from === null && 'Credit Card Charged:' }
                    {record.credited_to === null && 'Account Charged:' }
                </Text>

                <Text style={styles.inputFieldNoBorder}>
                    {record.withdrawn_from === null && getCreditName(creditMap, record.credited_to)}
                    {record.credited_to === null && getSavingName(savingMap, record.withdrawn_from)}

                </Text>
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={onSimpleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>
                    {loading ? 'Submitting...' : 'Submit'}
                </Text>
            </TouchableOpacity>
        </>
    )
}

export default DefaultPayModal;