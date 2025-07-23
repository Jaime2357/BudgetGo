import { modalStyles, styles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
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

import PaySingle from '../components/payButtons/spendModal';
import PayRec from '../components/recPayButtons/recSpendModal';
import SpendInsertModalForm from '../components/spendingScreen/SpendInsetModalForm';
import TransactionList from '../components/spendingScreen/TransactionList'; // unique to SpendingScreen
import PlannedExpensesList from '../components/tables/PlannedExpensesList';
import RecurringExpensesList from '../components/tables/RecurringExpensesList';

export default function SpendingScreen() {
  // States
  const [credit, setCredit] = useState<Map<number, CreditAccount>>(new Map());
  const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
  const [allReccuring, setAllReccuring] = useState<RecExpenses[]>([]);
  const [allPLanned, setAllPLanned] = useState<PlanExpenses[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingNames, setSavingNames] = useState<PickerItem[]>([]);
  const [creditNames, setCreditNames] = useState<PickerItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [recModalOpen, setRecModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [activeRecRecord, setActiveRecRecord] = useState<RecExpenses | null>(null);
  const [activePlanRecord, setActivePlanRecord] = useState<PlanExpenses | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setAllPLanned(allPLanned);
    setTransactions(transactions);
    setSavingNames(savings.map((acc) => ({ label: acc.name, value: acc.id })));
    setCreditNames(credits.map((acc) => ({ label: acc.name, value: acc.id })));
  }

  const onRefresh = async () => {
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
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Let's look at your finances</Text>
        </View>

        <View style={styles.innerContent}>
          <TransactionList
            transactions={transactions}
            credit={credit}
            saving={saving}
          />

          <RecurringExpensesList
            data={allReccuring}
            onPay={openRecModal}
          />

          <PlannedExpensesList
            data={allPLanned}
            onPay={openPlanModal}
            creditMap={credit}
            savingMap={saving}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={modalStyles.fabStyle}
        onPress={() => setMenuOpen(true)}
        activeOpacity={0.8}
      >
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
    </SafeAreaView>
  );
}
