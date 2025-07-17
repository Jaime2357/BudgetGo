import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/global';
import { CreditAccount, PlanExpenses, RecExpenses, RecIncome, SavingAccount } from '@/types/typeDefs';
import CardCarousel from '../components/homeScreen/carouselComponent';
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
              <Text>No savings saved.</Text>
            ) : (
              <CardCarousel cardProp={savingsWithImages} />
            )}
          </View>

          {/* 💳 Credit Accounts */}
          <View style={styles.islandBox}>
            {credits.length === 0 ? (
              <Text>No credit cards saved.</Text>
            ) : (
              <CardCarousel cardProp={creditWithImages} />
            )}
          </View>

          {/* 🔁 Recurring Expenses */}
          <View style={styles.islandTable}>
            {recExpenses.length === 0 ? (
              <Text>No Expenses.</Text>
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
                      <TouchableOpacity style={styles.tablePayButton}>
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
              <Text>No Expenses.</Text>
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
                        {getReadableDate(expense.paid_date)}
                      </Text>
                      <TouchableOpacity style={styles.tablePayButton}>
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
              <Text>No Income.</Text>
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
                        <TouchableOpacity style={styles.tablePayButton}>
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
    </SafeAreaView>
    // </ImageBackground>
  );
}
