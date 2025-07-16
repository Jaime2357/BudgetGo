import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import initDB from '../database/dbInit';
import accountRequest, { Income, RecIncome, SavingAccount } from '../database/dbReq';

export default function IncomeScreen() {
    useEffect(() => {
        async function setupAndFetch() {
            await initDB();
            const recIncome = await accountRequest.getAllRecIncome();
            const income = await accountRequest.getIncome();
            const allIncome = await accountRequest.getAllIncome();
            const savings = await accountRequest.getSaving();
            const savingMap = new Map(savings.map(saving => [saving.id, saving]));
            setSaving(savingMap);
            setRecIncome(recIncome);
            setIncome(income);
            setAllIncome(allIncome);
        }
        setupAndFetch();
    }, []);

    const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
    const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [allIncome, setAllIncome] = useState<Income[]>([]);

    function getReadableDate(date: Date) {
        const d = new Date(date);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }

    const getSavingName = (id: number | null | undefined): string => {
        if (!id) return '';
        const savingAccount = saving.get(id);
        return savingAccount?.name ?? '';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollableContainer}>
                <View style={styles.welcomeHeader}>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtext}>Let&apos;s look at your finances</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.extendedIslandTable}>
                        {allIncome.length === 0 ? (
                            <Text>No Income.</Text>
                        ) : (
                            <View>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardHeaderText}>Income</Text>
                                </View>
                                <ScrollView
                                    nestedScrollEnabled
                                    contentContainerStyle={{ paddingBottom: 40 }}
                                    style={{ flexGrow: 1 }}
                                >
                                    {allIncome.map((income) => (
                                        <View key={income.id} style={styles.cardTableRow}>
                                            <View style={{ flexDirection: 'column', width: '50%' }}>
                                                <Text style={styles.cardRowTextLeft}>{income.name}:</Text>
                                                <Text style={styles.cardRowTextLeft}>${income.amount} ({income.type})</Text>
                                            </View>
                                            {income.received ? (
                                                <View style={{ flexDirection: 'column', width: '50%' }}>
                                                    <Text style={styles.cardRowTextRight}>
                                                        {getSavingName(income.deposited_to)} Received
                                                    </Text>
                                                    <Text style={styles.cardRowTextRight}>
                                                        {getReadableDate(income.paid_date)}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={{ flexDirection: 'column', width: '50%' }}>
                                                    <Text style={styles.cardRowTextRight}>
                                                        {getSavingName(income.deposited_to)}
                                                    </Text>
                                                    <Text style={styles.cardRowTextRight}>
                                                        {getReadableDate(income.paid_date)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    <View style={styles.islandTable}>
                        {recIncome.length === 0 ? (
                            <Text>No Income.</Text>
                        ) : (
                            <View>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardHeaderText}>Recurring Income</Text>
                                </View>
                                <ScrollView
                                    nestedScrollEnabled
                                    contentContainerStyle={{ paddingBottom: 40 }}
                                    style={{ flexGrow: 1 }}
                                >
                                    {recIncome.map((income) => (
                                        <View key={income.id} style={styles.cardTableRow}>
                                            <View style={{ flexDirection: 'column', width: '50%' }}>
                                                <Text style={styles.cardRowTextLeft}>{income.name}:</Text>
                                                <Text style={styles.cardRowTextLeft}>${income.amount}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'column', width: '50%' }}>
                                                <Text style={styles.cardRowTextRight}>
                                                    {income.expected_date}th
                                                </Text>
                                                {!income.received ? (
                                                    <TouchableOpacity style={styles.tablePayButton}>
                                                        <Text style={styles.tablePayButtonText}>Log</Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Text style={styles.cardRowTextRight}>Received</Text>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    <View style={styles.islandTable}>
                        {income.length === 0 ? (
                            <Text>No Expenses.</Text>
                        ) : (
                            <View>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardHeaderText}>Pending Income</Text>
                                </View>
                                <ScrollView
                                    nestedScrollEnabled
                                    contentContainerStyle={{ paddingBottom: 40 }}
                                    style={{ flexGrow: 1 }}
                                >
                                    {income.map((pIncome) => (
                                        <View key={pIncome.id} style={styles.cardTableRow}>
                                            <View style={{ flexDirection: 'column', width: '50%' }}>
                                                <Text style={styles.cardRowTextLeft}>{pIncome.name}:</Text>
                                                <Text style={styles.cardRowTextLeft}>${pIncome.amount}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'column', width: '50%' }}>
                                                <Text style={styles.cardRowTextRight}>{getSavingName(pIncome.deposited_to)}</Text>
                                                <Text style={styles.cardRowTextRight}>{getReadableDate(pIncome.paid_date)}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollableContainer: {
        flexGrow: 1,
        alignItems: 'center',
    },
    contentContainer: {
        backgroundColor: 'black',
        width: '100%',
        alignItems: 'center',
        paddingTop: 20,
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
        paddingBottom: 20
    },
    welcomeHeader: {
        marginBottom: 25,
        paddingVertical: 13,
        fontFamily: 'Tektur-Sub',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Tektur',
        color: '#fff',
        marginBottom: 4,
    },
    welcomeSubtext: {
        fontSize: 16,
        color: '#ccc',
    },
    islandTable: {
        backgroundColor: 'rgba(35, 35, 35, 0.9)',
        borderColor: 'rgba(74, 144, 226, 0.18)',
        borderWidth: 1,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
        marginVertical: 17,
        width: '90%',
        overflow: 'hidden'
    },
    extendedIslandTable: {
        backgroundColor: 'rgba(35, 35, 35, 0.92)',
        borderColor: 'rgba(74, 144, 226, 0.18)',
        borderWidth: 1,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
        marginVertical: 17,
        width: '90%',
        aspectRatio: 0.5,
        overflow: 'hidden'
    },
    cardHeader: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        backgroundColor: 'rgba(74, 144, 226, 0.18)'
    },
    cardHeaderText: {
        fontSize: 20,
        fontFamily: 'Tektur-Head',
        color: 'white'
    },
    cardTableRow: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 13,
        borderBottomWidth: 1,
        width: '95%',
        borderBottomColor: 'white',
        alignSelf: 'center',
        flexDirection: 'row'
    },
    cardRowTextLeft: {
        fontSize: 15,
        fontFamily: 'Tektur-Sub',
        color: 'white',
        marginVertical: 2
    },
    cardRowTextRight: {
        fontSize: 15,
        fontFamily: 'Tektur-Sub',
        marginVertical: 2,
        color: 'white',
        textAlign: 'right',
    },
    tablePayButton: {
        paddingVertical: 2,
        marginVertical: 2,
        width: '50%',
        height: '50%',
        backgroundColor: 'rgba(74, 144, 226, 0.18)',
        borderRadius: 8,
        justifyContent: 'center',
        alignSelf: 'flex-end'
    },
    tablePayButtonText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Tektur-Sub',
        textAlign: 'center',
        justifyContent: 'center'
    }
});
