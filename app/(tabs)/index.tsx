import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/global';
import { CreditAccount, PlanExpenses, RecExpenses, RecIncome, SavingAccount } from '@/types/typeDefs';
import actions from '../components/actions';
import CardCarousel from '../components/homeScreen/carouselComponent';
import PaySingle from '../components/payButtons/spendModal';
import PayRec from '../components/recPayButtons/recSpendModal';
import initDB from '../database/dbInit';
import dataRequest from '../database/dbReq';

export default function HomeScreen() {

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
    setSavingNames(saving.map(acc => ({ label: acc.name, value: acc.id })));
    setCreditNames(credits.map(acc => ({ label: acc.name, value: acc.id })));
    setSavingMap(new Map(saving.map(s => [s.id, s])))
    setCreditMap(new Map(credits.map(s => [s.id, s])))

    const thisMonth = new Date();
    const monthName = thisMonth.toLocaleString('default', { month: 'long' });
    setMonth(monthName);
  }

  const [savings, setSavings] = useState<SavingAccount[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [recExpenses, setRecExpenses] = useState<RecExpenses[]>([]);
  const [planExpenses, setPlanExpenses] = useState<PlanExpenses[]>([]);
  const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
  const [month, setMonth] = useState<string>('January');
  const [savingNames, setSavingNames] = useState<{ label: string; value: number }[]>([])
  const [creditNames, setCreditNames] = useState<{ label: string; value: number }[]>([])
  const [savingMap, setSavingMap] = useState<Map<number, SavingAccount>>(new Map())
  const [creditMap, setCreditMap] = useState<Map<number, CreditAccount>>(new Map())

  const [refreshing, setRefreshing] = useState(false);

  const savingKeys = ['blue', 'red'];
  const creditKeys = ['bofa', 'venmo'];

  const savingsWithImages = savings.map((item, idx) => ({
    ...item,
    type: 'savings' as const,
    imageKey: savingKeys[idx % savingKeys.length],
  }));

  const creditWithImages = credits.map((item, idx) => ({
    ...item,
    type: 'credit' as const,
    imageKey: creditKeys[idx % creditKeys.length],
  }));

  const [recModalOpen, setRecModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [activeRecRecord, setActiveRecRecord] = useState<RecExpenses | null>(null);
  const [activePlanRecord, setActivePlanRecord] = useState<PlanExpenses | null>(null);

  const openRecModal = (record: RecExpenses) => {
    setActiveRecRecord(record);
    setRecModalOpen(true);
  };

  const openPlanModal = (record: PlanExpenses) => {
    setActivePlanRecord(record);
    setPlanModalOpen(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await setupAndFetch(); // Call your data reload logic here
    setRefreshing(false);
  };

  return (
    // <ImageBackground
    //   source={imageMap['background']}
    //   style={{ flex: 1 }}
    //   resizeMode="cover"
    // >
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollableContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* 👋 Welcome message */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSubtext}>Let&apos;s look at your finances</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* 📦 Saving Accounts */}
          <View style={styles.islandBox}>
            {savings.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Accounts Saved</Text>
              </View>
            ) : (
              <CardCarousel cardProp={savingsWithImages} />
            )}
          </View>

          {/* 💳 Credit Accounts */}
          <View style={styles.islandBox}>
            {credits.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Credit Cards Saved</Text>
              </View>
            ) : (
              <CardCarousel cardProp={creditWithImages} />
            )}
          </View>

          {/* 🔁 Recurring Expenses */}
          <View style={styles.islandTable}>
            {recExpenses.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Monthly Expenses</Text>
              </View>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>{month} Expenses</Text>
                </View>
                {recExpenses.map((expense) => (
                  <View key={expense.id} style={styles.cardTableRow}>
                    <View style={{ flexDirection: 'column', width: '50%' }}>
                      <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                      <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', width: '50%' }}>
                      <Text style={styles.cardRowTextRight}>
                        Due {expense.reccurring_date}th
                      </Text>
                      <TouchableOpacity
                        onPress={() => openRecModal(expense)}
                        style={styles.tablePayButton}>
                        <Text style={styles.tablePayButtonText}>Pay</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* 📅 Planned Expenses */}
          <View style={styles.islandTable}>
            {planExpenses.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Planned Expenses </Text>
              </View>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Planned Expenses</Text>
                </View>
                {planExpenses.map((expense) => (
                  <View key={expense.id} style={styles.cardTableRow}>
                    <View style={{ flexDirection: 'column', width: '50%' }}>
                      <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                      <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', width: '50%' }}>
                      <Text style={styles.cardRowTextRight}>
                        {actions.getReadableDate(expense.paid_date)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => openPlanModal(expense)}
                        style={styles.tablePayButton}>
                        <Text style={styles.tablePayButtonText}>Pay</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* 💸 Recurring Income */}
          <View style={styles.islandTable}>
            {recIncome.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Reccurring Income</Text>
              </View>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Recurring Income</Text>
                </View>
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
                        <TouchableOpacity
                          style={styles.tablePayButton}
                          onPress={() => actions.handleLogClick(income.amount, income.deposited_to, 'reccurring_income', Number(income.id))}>
                          <Text style={styles.tablePayButtonText}>Log</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.cardRowTextRight}>Received</Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>
      {activeRecRecord && (
        <PayRec
          record={activeRecRecord}
          visible={recModalOpen}
          onClose={() => setRecModalOpen(false)}
          onSuccess={() => {
            setRecModalOpen(false);
            onRefresh();  // refresh the recurring expenses list
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
            onRefresh();  // refresh the recurring expenses list
          }}
          savingOptions={savingNames}
          creditOptions={creditNames}
          savingMap={savingMap}
          creditMap={creditMap}
        />
      )}
    </SafeAreaView>
    // </ImageBackground>
  );
}
