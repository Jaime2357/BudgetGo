import { styles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CreditAccount,
  PlanExpenses,
  RecExpenses,
  SavingAccount,
  Transaction,
} from '@/types/typeDefs';

import initDB from '../database/dbInit';
import accountRequest from '../database/dbReq';

import PaySingle from '../components/payButtons/spendModal';
import PayRec from '../components/recPayButtons/recSpendModal';
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
  const [savingNames, setSavingNames] = useState<{ label: string; value: number }[]>([]);
  const [creditNames, setCreditNames] = useState<{ label: string; value: number }[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [recModalOpen, setRecModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [activeRecRecord, setActiveRecRecord] = useState<RecExpenses | null>(null);
  const [activePlanRecord, setActivePlanRecord] = useState<PlanExpenses | null>(null);

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
        contentContainerStyle={styles.scrollableContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSubtext}>Let's look at your finances</Text>
        </View>

        <View style={styles.contentContainer}>
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
