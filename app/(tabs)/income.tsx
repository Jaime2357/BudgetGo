// screens/IncomeScreen.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { modalStyles, styles } from '@/styles/global';
import { Income, RecIncome, SavingAccount } from '@/types/typeDefs';
import initDB from '../database/dbInit';
import dataRequest from '../database/dbReq';

import IncomeModalForm from '../components/incomeScreen/IncomeModalForm';
import IncomeSection from '../components/incomeScreen/IncomeSection';
import RecurringIncomeTable from '../components/tables/RecurringIncomeTable';

export default function IncomeScreen() {

    const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
    const [savingNames, setSavingNames] = useState<{ label: string; value: number }[]>([]);
    const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [allIncome, setAllIncome] = useState<Income[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const setupAndFetch = async () => {
        await initDB();
        const recIncome = await dataRequest.getAllRecIncome();
        const income = await dataRequest.getIncome();
        const allIncome = await dataRequest.getAllIncome();
        const savings = await dataRequest.getSaving();
        setSaving(new Map(savings.map(s => [s.id, s])));
        setSavingNames(savings.map(acc => ({ label: acc.name, value: acc.id })));
        setRecIncome(recIncome);
        setIncome(income);
        setAllIncome(allIncome);
        setMenuOpen(false);
    };

    useFocusEffect(useCallback(() => {
        setupAndFetch();
    }, []));

    const onRefresh = async () => {
        setRefreshing(true);
        await setupAndFetch();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollableContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                <View style={styles.welcomeHeader}>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtext}>Let&apos;s look at your finances</Text>
                </View>

                <View style={styles.contentContainer}>
                    <IncomeSection title="Income" data={allIncome} refData={saving} />
                    <RecurringIncomeTable data={recIncome} refData={saving} title="Recurring Income" />
                    <IncomeSection title="Pending Income" data={income} refData={saving} />
                </View>
            </ScrollView>

            <TouchableOpacity
                style={modalStyles.fabStyle}
                onPress={() => setMenuOpen(true)}
                activeOpacity={0.8}
            >
                <Text style={{ fontSize: 32, color: '#fff', fontWeight: 'bold' }}>＋</Text>
            </TouchableOpacity>

            <IncomeModalForm
                visible={menuOpen}
                onClose={() => setMenuOpen(false)}
                onSuccess={() => {
                    setMenuOpen(false);
                    setupAndFetch();
                }}
                savingOptions={savingNames}
            />
        </SafeAreaView>
    );
}
