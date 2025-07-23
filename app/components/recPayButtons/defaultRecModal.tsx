import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import dataPost from "@/app/database/dbPost";
import { styles } from "@/styles/global";
import { CreditAccount, RecExpenses } from "@/types/typeDefs";
import actions, { getCreditName } from "../actions";

interface DefaultRecProps {
    record: RecExpenses;
    onSuccess: () => void;
    creditMap: Map<number, CreditAccount>
}

const DefaultRecModal: React.FC<DefaultRecProps> = ({ record, onSuccess, creditMap }) => {

    const [loading, setLoading] = useState(false);

    async function onSimpleSubmit() {

        try {

            await dataPost.logRecSpend(
                record.id, record.name, record.type,
                record.amount, record.credited_to, actions.getFullDate(record.reccurring_date))

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
                    {actions.getReadableDate(actions.getFullDate(record.reccurring_date))}
                </Text>
            </View>

            <View>
                <Text style={styles.formLabel}>
                    Credit Card Charged:
                </Text>

                <Text style={styles.inputFieldNoBorder}>
                    {getCreditName(creditMap, record.credited_to)}
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

export default DefaultRecModal;