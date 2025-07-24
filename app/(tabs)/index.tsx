import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/global';
import initDB from '../database/dbInit';
import dataPost from '../database/dbPost';
import dataRequest from '../database/dbReq';

import {
  CardComponentProps,
  CreditAccount,
  PlanExpenses,
  RecExpenses,
  RecIncome,
  SavingAccount
} from '@/types/typeDefs';

import EmptyListNotice from '../components/global/EmptyListNotice';
import CardCarousel from '../components/homeScreen/carouselComponent';

import PlannedExpensesList from '../components/tables/PlannedExpensesList';
import RecurringExpensesList from '../components/tables/RecurringExpensesList';

import Header from '../components/global/Header';
import ModCardModal from '../components/homeScreen/modCard';
import NewCardModal from '../components/homeScreen/newCard';
import PaySingle from '../components/payButtons/spendModal';
import PayRec from '../components/recPayButtons/recSpendModal';
import RecurringIncomeTable from '../components/tables/RecurringIncomeTable';

export default function HomeScreen() {

  const [savings, setSavings] = useState<SavingAccount[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [recExpenses, setRecExpenses] = useState<RecExpenses[]>([]);
  const [planExpenses, setPlanExpenses] = useState<PlanExpenses[]>([]);
  const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
  const [month, setMonth] = useState('January');

  const [savingMap, setSavingMap] = useState<Map<number, SavingAccount>>(new Map());
  const [creditMap, setCreditMap] = useState<Map<number, CreditAccount>>(new Map());
  const [savingNames, setSavingNames] = useState<{ label: string; value: number }[]>([]);
  const [creditNames, setCreditNames] = useState<{ label: string; value: number }[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [recModalOpen, setRecModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [activeRecRecord, setActiveRecRecord] = useState<RecExpenses | null>(null);
  const [activePlanRecord, setActivePlanRecord] = useState<PlanExpenses | null>(null);
  const [savingFormOpen, setSavingFormOpen] = useState<boolean>(false);
  const [creditFormOpen, setCreditFormOpen] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<SavingAccount | CreditAccount | null>(null);
  const [editCardType, setEditCardType] = useState<'savings' | 'credit' | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setupAndFetch();
    }, [])
  );

  async function setupAndFetch() {
    await initDB();

    const saving = await dataRequest.getSaving();
    const credits = await dataRequest.getCredit();
    const recExpenses = await dataRequest.getRecExpenses();
    const planExpenses = await dataRequest.getPlanExpenses();
    const recIncome = await dataRequest.getRecIncome();

    setSavings(saving);
    setCredits(credits);
    setRecExpenses(recExpenses);
    setPlanExpenses(planExpenses);
    setRecIncome(recIncome);

    setSavingMap(new Map(saving.map((s) => [s.id, s])));
    setCreditMap(new Map(credits.map((c) => [c.id, c])));
    setSavingNames(saving.map((acc) => ({ label: acc.name, value: acc.id })));
    setCreditNames(credits.map((acc) => ({ label: acc.name, value: acc.id })));

    const today = new Date();
    setMonth(today.toLocaleString('default', { month: 'long' }));

    const currentDate = today.getDate();

    if (currentDate === 30) await dataPost.monthlyPreset();
    if (currentDate === 1) await dataPost.monthlyReset();
  }

  const savingsCardEntry: CardComponentProps[] = [
    ...savings.map((item, idx) => ({
      ...item,
      type: 'savings' as const,
      imageKey: item.image_uri ? null : ['blue', 'red'][idx % 2],
      image_uri: item.image_uri,
    })),
    { type: 'add', id: 'add' }
  ];

  const creditsCardEntry: CardComponentProps[] = [
    ...credits.map((item, idx) => ({
      ...item,
      type: 'credit' as const,
      imageKey: item.image_uri ? null : ['blue', 'red'][idx % 2],
      image_uri: item.image_uri,
    })),
    { type: 'add', id: 'add' }
  ];



  const openRecModal = (record: RecExpenses) => {
    setActiveRecRecord(record);
    setRecModalOpen(true);
  };

  const openPlanModal = (record: PlanExpenses) => {
    setActivePlanRecord(record);
    setPlanModalOpen(true);
  };

  const openEditModal = (card: SavingAccount | CreditAccount, type: "savings" | "credit") => {
    setEditCard(card);
    setEditCardType(type);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditCard(null);
    setEditCardType(null);
  };

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

        <Header message="Your budget at a glance" />

        <View style={styles.innerContent}>
          <View style={styles.contentBox}>
            {savingsCardEntry.length === 0 ? (
              <EmptyListNotice message="No Accounts Saved" />
            ) : (
              <CardCarousel
                cardProp={savingsCardEntry}
                onAddCard={() => setSavingFormOpen(true)}
                onEditCard={openEditModal} />
            )}
          </View>

          <View style={styles.contentBox}>
            {creditsCardEntry.length === 0 ? (
              <EmptyListNotice message="No Credit Cards Saved" />
            ) : (
              <CardCarousel
                cardProp={creditsCardEntry}
                onAddCard={() => setCreditFormOpen(true)}
                onEditCard={openEditModal} />
            )}
          </View>

          <RecurringExpensesList
            data={recExpenses}
            month={month}
            onPay={openRecModal}
            refreshOnDelete={refreshOnDelete}
          />

          <PlannedExpensesList
            data={planExpenses}
            onPay={openPlanModal}
            creditMap={creditMap}
            savingMap={savingMap}
            refreshOnDelete={refreshOnDelete}
          />

          <RecurringIncomeTable
            data={recIncome}
            refData={savingMap}
            refreshOnDelete={refreshOnDelete}
          />

        </View>
      </ScrollView>

      <NewCardModal
        accountType={'account'}
        visible={savingFormOpen}
        onClose={() => setSavingFormOpen(false)}
        onSuccess={() => {
          setSavingFormOpen(false);
          onRefresh();
        }}
      />

      <NewCardModal
        accountType={'credit'}
        visible={creditFormOpen}
        onClose={() => setCreditFormOpen(false)}
        onSuccess={() => {
          setCreditFormOpen(false);
          onRefresh();
        }}
      />

      {editCard && editCardType && (
        <ModCardModal
          account={editCard}
          accountType={editCardType}
          visible={editModalVisible}
          onClose={closeEditModal}
          onSuccess={() => {
            closeEditModal();
            onRefresh(); // reload data after edit success
          }}
        />
      )}

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
          creditMap={creditMap}
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
          savingMap={savingMap}
          creditMap={creditMap}
        />
      )}
    </SafeAreaView>
  );
}
