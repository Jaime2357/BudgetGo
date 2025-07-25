import { modalStyles, styles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CreditAccount,
  PickerItem,
  PlanExpenses,
  RecExpenses,
  SavingAccount,
  Transaction
} from '@/types/typeDefs';

import initDB from '../database/dbInit';
import accountRequest from '../database/dbReq';

import Header from '../components/global/Header';
import PaySingle from '../components/payButtons/spendModal';
import PayRec from '../components/recPayButtons/recSpendModal';
import SpendInsertModalForm from '../components/spendingScreen/SpendInsertModalForm';
import PlannedExpensesList from '../components/tables/PlannedExpensesList';
import RecurringExpensesList from '../components/tables/RecurringExpensesList';
import { FilterSortModal } from '../components/tables/SortFilterModals/SortFilterModal';
import TransactionList from '../components/tables/TransactionList';

export default function SpendingScreen() {
    const [credit, setCredit] = useState<Map<number, CreditAccount>>(new Map());
    const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
    const [allReccuring, setAllReccuring] = useState<RecExpenses[]>([]);
    const [allPLanned, setAllPlanned] = useState<PlanExpenses[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [savingNames, setSavingNames] = useState<PickerItem[]>([]);
    const [creditNames, setCreditNames] = useState<PickerItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const [recModalOpen, setRecModalOpen] = useState(false);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [activeRecRecord, setActiveRecRecord] = useState<RecExpenses | null>(null);
    const [activePlanRecord, setActivePlanRecord] = useState<PlanExpenses | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filteringTable, setFilteringTable] = useState<'transactions' | 'recurring' | 'planned' | null>(null);

    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
    const [filteredRecurring, setFilteredRecurring] = useState<RecExpenses[]>(allReccuring);
    const [filteredPlanned, setFilteredPlanned] = useState<PlanExpenses[]>(allPLanned);

    useEffect(() => { setFilteredTransactions(transactions); }, [transactions]);
    useEffect(() => { setFilteredRecurring(allReccuring); }, [allReccuring]);
    useEffect(() => { setFilteredPlanned(allPLanned); }, [allPLanned]);

    function openFilterFor(tableName: 'transactions' | 'recurring' | 'planned') {
      setFilteringTable(tableName);
      setFilterModalVisible(true);
    }

    let modalData: any[] = [];
    let modalAllData: any[] = [];
    let amountField: any = 'amount';
    let dateField: any = 'transaction_date';
    let typeField: any = 'type';
    let paidField: any | undefined;

    switch (filteringTable) {
      case 'transactions':
        modalData = transactions;
        modalAllData = transactions;
        amountField = 'amount';
        dateField = 'transaction_date';
        typeField = 'type';
        paidField = undefined;
        break;
      case 'recurring':
        modalData = allReccuring;
        modalAllData = allReccuring;
        amountField = 'amount';
        dateField = 'reccurring_date'; // numeric day 1-31
        typeField = 'type';
        paidField = 'paid_for_month';
        break;
      case 'planned':
        modalData = allPLanned;
        modalAllData = allPLanned;
        amountField = 'amount';
        dateField = 'paid_date';
        typeField = 'type';
        paidField = 'paid';
        break;
      default:
        modalData = [];
        modalAllData = [];
    }

    function onApplyFilter(filteredSortedData: any[]) {
      switch (filteringTable) {
        case 'transactions': setFilteredTransactions(filteredSortedData); break;
        case 'recurring': setFilteredRecurring(filteredSortedData); break;
        case 'planned': setFilteredPlanned(filteredSortedData); break;
      }
      setFilterModalVisible(false);
      setFilteringTable(null);
    }

    useFocusEffect(
      React.useCallback(() => {
        setupAndFetch();
      }, [])
    );

    async function setupAndFetch() {
      await initDB();
      const credits = await accountRequest.getCredit();
      const savings = await accountRequest.getSaving();
      const allReccuring = await accountRequest.getAllRecurring();
      const allPLanned = await accountRequest.getAllPlanned();
      const transactions = await accountRequest.getAllTransactions();

      setCredit(new Map(credits.map((c) => [c.id, c])));
      setSaving(new Map(savings.map((s) => [s.id, s])));
      setAllReccuring(allReccuring);
      setAllPlanned(allPLanned);
      setTransactions(transactions);
      setSavingNames(savings.map((acc) => ({ label: acc.name, value: acc.id })));
      setCreditNames(credits.map((acc) => ({ label: acc.name, value: acc.id })));
    }

    const onRefresh = async () => {
      setRefreshing(true);
      await setupAndFetch();
      setRefreshing(false);
    };

    const refreshOnDelete = async () => {
      setRefreshing(true);
      await setupAndFetch();
      setRefreshing(false);
    };

    const openRecModal = (record: RecExpenses) => {
      setActiveRecRecord(record);
      setRecModalOpen(true);
    };

    const openPlanModal = (record: PlanExpenses) => {
      setActivePlanRecord(record);
      setPlanModalOpen(true);
    };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollViewContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          <Header message="See Your Spending" />

          <View style={styles.innerContent}>
            <TransactionList
              transactions={filteredTransactions}
              credit={credit}
              saving={saving}
              refreshOnDelete={refreshOnDelete}
              onFilterPress={() => openFilterFor('transactions')}
            />

            <RecurringExpensesList
              data={filteredRecurring}
              onPay={openRecModal}
              refreshOnDelete={refreshOnDelete}
              onFilterPress={() => openFilterFor('recurring')}
            />

            <PlannedExpensesList
              data={filteredPlanned}
              onPay={openPlanModal}
              creditMap={credit}
              savingMap={saving}
              refreshOnDelete={refreshOnDelete}
              onFilterPress={() => openFilterFor('planned')}
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={modalStyles.fabStyle} onPress={() => setMenuOpen(true)} activeOpacity={0.8}>
          <Text style={{ fontSize: 32, color: '#fff', fontWeight: 'bold' }}>＋</Text>
        </TouchableOpacity>

        <SpendInsertModalForm
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSuccess={() => {
            setMenuOpen(false);
            setupAndFetch();
          }}
          savingOptions={savingNames}
          creditOptions={creditNames}
        />

        {activeRecRecord && (
          <PayRec
            record={activeRecRecord}
            visible={recModalOpen}
            onClose={() => setRecModalOpen(false)}
            onSuccess={() => {
              setRecModalOpen(false);
              onRefresh();
            }}
            creditOptions={creditNames}
            creditMap={credit}
          />
        )}

        {activePlanRecord && (
          <PaySingle
            record={activePlanRecord}
            visible={planModalOpen}
            onClose={() => setPlanModalOpen(false)}
            onSuccess={() => {
              setPlanModalOpen(false);
              onRefresh();
            }}
            savingOptions={savingNames}
            creditOptions={creditNames}
            savingMap={saving}
            creditMap={credit}
          />
        )}

        <FilterSortModal
          visible={filterModalVisible}
          data={modalData}
          allData={modalAllData}
          onApply={onApplyFilter}
          onCancel={() => setFilterModalVisible(false)}
          amountField={amountField}
          dateField={dateField}
          typeField={typeField}
          paidField={paidField}
        />
      </SafeAreaView>
    );
}