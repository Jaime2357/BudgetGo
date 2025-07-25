import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { modalStyles, styles } from '@/styles/global';
import { Income, RecIncome, SavingAccount } from '@/types/typeDefs';
import initDB from '../database/dbInit';
import dataRequest from '../database/dbReq';

import Header from '../components/global/Header';
import IncomeModalForm from '../components/incomeScreen/IncomeModalForm';
import IncomeSection from '../components/tables/IncomeSection';
import RecurringIncomeTable from '../components/tables/RecurringIncomeTable';
import { FilterSortModal } from '../components/tables/SortFilterModals/SortFilterModal';

export default function IncomeScreen() {
    const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
    const [savingNames, setSavingNames] = useState<{ label: string; value: number }[]>([]);
    const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [allIncome, setAllIncome] = useState<Income[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filteringTable, setFilteringTable] = useState<'allIncome' | 'pendingIncome' | 'recIncome' | null>(null);

    const [filteredAllIncome, setFilteredAllIncome] = useState<Income[]>(allIncome);
    const [filteredPendingIncome, setFilteredPendingIncome] = useState<Income[]>(income);
    const [filteredRecIncome, setFilteredRecIncome] = useState<RecIncome[]>(recIncome);

    useEffect(() => setFilteredAllIncome(allIncome), [allIncome]);
    useEffect(() => setFilteredPendingIncome(income), [income]);
    useEffect(() => setFilteredRecIncome(recIncome), [recIncome]);

    let modalData: any[] = [];
    let modalAllData: any[] = [];
    let amountField: keyof Income | keyof RecIncome = 'amount';
    let dateField: keyof Income | keyof RecIncome = 'paid_date';
    let typeField = 'type';
    let paidField: keyof Income | keyof RecIncome | undefined;

    switch (filteringTable) {
        case 'allIncome':
            modalData = allIncome;
            modalAllData = allIncome;
            amountField = 'amount';
            dateField = 'paid_date';
            typeField = 'type';
            paidField = 'received';
            break;
        case 'pendingIncome':
            modalData = income;
            modalAllData = income;
            amountField = 'amount';
            dateField = 'paid_date';
            typeField = 'type';
            paidField = 'received';
            break;
        case 'recIncome':
            modalData = recIncome;
            modalAllData = recIncome;
            amountField = 'amount';
            dateField = 'expected_date';
            typeField = 'type';
            paidField = 'received';
            break;
        default:
            modalData = [];
            modalAllData = [];
    }

    function onApplyFilter(filteredSortedData: Income[] | RecIncome[]) {
        switch (filteringTable) {
            case 'allIncome':
                setFilteredAllIncome(filteredSortedData as Income[]);
                break;
            case 'pendingIncome':
                setFilteredPendingIncome(filteredSortedData as Income[]);
                break;
            case 'recIncome':
                setFilteredRecIncome(filteredSortedData as RecIncome[]);
                break;
        }
        setFilterModalVisible(false);
        setFilteringTable(null);
    }

    function openFilterFor(tableName: 'allIncome' | 'pendingIncome' | 'recIncome') {
        setFilteringTable(tableName);
        setFilterModalVisible(true);
    }

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

    useFocusEffect(useCallback(() => { setupAndFetch(); }, []));

    const refreshOnDelete = async () => {
        setRefreshing(true);
        await setupAndFetch();
        setRefreshing(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await setupAndFetch();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollViewContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                <Header message="Track Your Income" />

                <View style={styles.innerContent}>

                    <IncomeSection 
                    title="Income" 
                    data={filteredAllIncome} 
                    refreshOnDelete={refreshOnDelete}
                    onFilterPress={() => openFilterFor('allIncome')} 
                    />

                    <RecurringIncomeTable 
                    data={filteredRecIncome} 
                    refData={saving} 
                    title="Recurring Income" 
                    refreshOnDelete={refreshOnDelete}
                    onFilterPress={() => openFilterFor('recIncome')}
                    />

                    <IncomeSection 
                    title="Pending Income" 
                    data={filteredPendingIncome} 
                    refreshOnDelete={refreshOnDelete}
                    onFilterPress={() => openFilterFor('pendingIncome')}
                    />
                </View>
            </ScrollView>

            <TouchableOpacity style={modalStyles.fabStyle} onPress={() => setMenuOpen(true)} activeOpacity={0.8}>
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

            {(filteringTable === 'allIncome' || filteringTable === 'pendingIncome') && (
                <FilterSortModal<Income>
                    visible={filterModalVisible}
                    data={modalData as Income[]}
                    allData={modalAllData as Income[]}
                    onApply={onApplyFilter}
                    onCancel={() => setFilterModalVisible(false)}
                    amountField={amountField as keyof Income}
                    dateField={dateField as keyof Income}
                    typeField={typeField as keyof Income}
                    paidField={paidField as keyof Income | undefined}
                />
            )}

            {filteringTable === 'recIncome' && (
                <FilterSortModal<RecIncome>
                    visible={filterModalVisible}
                    data={modalData as RecIncome[]}
                    allData={modalAllData as RecIncome[]}
                    onApply={onApplyFilter}
                    onCancel={() => setFilterModalVisible(false)}
                    amountField={amountField as keyof RecIncome}
                    dateField={dateField as keyof RecIncome}
                    typeField={typeField as keyof RecIncome}
                    paidField={paidField as keyof RecIncome | undefined}
                />
            )}
        </SafeAreaView>
    );
}