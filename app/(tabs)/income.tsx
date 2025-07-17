import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/global';
import { Income, RecIncome, SavingAccount } from '@/types/typeDefs';
import initDB from '../database/dbInit';
import dataRequest from '../database/dbReq';

export default function IncomeScreen() {

    useFocusEffect(
        React.useCallback(() => {
            setupAndFetch();
        }, [])
    );

    async function setupAndFetch() {
        await initDB();
        const recIncome = await dataRequest.getAllRecIncome();
        const income = await dataRequest.getIncome();
        const allIncome = await dataRequest.getAllIncome();
        const savings = await dataRequest.getSaving();
        const savingMap = new Map(savings.map(saving => [saving.id, saving]));
        setSaving(savingMap);
        setRecIncome(recIncome);
        setIncome(income);
        setAllIncome(allIncome);
    }

    const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
    const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [allIncome, setAllIncome] = useState<Income[]>([]);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await setupAndFetch(); // Call your data reload logic here
        setRefreshing(false);
    };

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
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollableContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff"
                    />
                }>

                <View style={styles.welcomeHeader}>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtext}>Let&apos;s look at your finances</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.islandTable}>
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
