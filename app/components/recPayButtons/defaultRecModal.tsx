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

            await dataPost.postRecSpend(
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
            <Text style={styles.transSubtitle}>
                Is the following information correct:
            </Text>

            <View>
                <Text style={styles.transLabel}>
                    Amount:
                </Text>
                <Text style={styles.transValue}>
                    ${record.amount}
                </Text>
            </View>

            <View>
                <Text style={styles.transLabel}>
                    Type:
                </Text>

                <Text style={styles.transValue}>
                    {record.type}
                </Text>
            </View>

            <View>
                <Text style={styles.transLabel}>
                    Date:
                </Text>

                <Text style={styles.transValue}>
                    {actions.getReadableDate(actions.getFullDate(record.reccurring_date))}
                </Text>
            </View>

            <View>
                <Text style={styles.transLabel}>
                    Credit Card Charged:
                </Text>

                <Text style={styles.transValue}>
                    {getCreditName(creditMap, record.credited_to)}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.transSubmitButton}
                onPress={onSimpleSubmit}
                disabled={loading}
            >
                <Text style={styles.transSubmitButtonText}>
                    {loading ? 'Submitting...' : 'Submit'}
                </Text>
            </TouchableOpacity>
        </>
    )
}

export default DefaultRecModal;