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

            await dataPost.postPlanSpend(
                record.id, record.name, record.type,
                record.amount, record.credited_to, record.withdrawn_from, String(record.paid_date))

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
                    {actions.getReadableDate(record.paid_date)}
                </Text>
            </View>

            <View>
                <Text style={styles.transLabel}>
                    Credit Card Charged:
                </Text>

                <Text style={styles.transValue}>
                    {record.withdrawn_from === null && getCreditName(creditMap, record.credited_to)}
                    {record.credited_to === null && getSavingName(savingMap, record.withdrawn_from)}

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

export default DefaultPayModal;