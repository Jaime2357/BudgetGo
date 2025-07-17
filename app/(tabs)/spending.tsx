import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/global';
import { CreditAccount, PlanExpenses, RecExpenses, SavingAccount, Transaction } from '@/types/typeDefs';
import initDB from '../database/dbInit';
import accountRequest from '../database/dbReq';

export default function SpendingScreen() {

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
    const creditMap = new Map(credits.map(credit => [credit.id, credit]));
    const savingMap = new Map(savings.map(saving => [saving.id, saving]));
    setCredit(creditMap);
    setSaving(savingMap);
    setAllReccuring(allReccuring);
    setAllPLanned(allPLanned);
    setTransactions(transactions);
  }

  const [credit, setCredit] = useState<Map<number, CreditAccount>>(new Map());
  const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
  const [allReccuring, setAllReccuring] = useState<RecExpenses[]>([]);
  const [allPLanned, setAllPLanned] = useState<PlanExpenses[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  function getReadableDate(date: Date) {
    const d = new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await setupAndFetch(); // Call your data reload logic here
    setRefreshing(false);
  };

  const getCreditName = (id: number | null | undefined): string => {
    if (!id) return '';
    const creditAccount = credit.get(id);
    return creditAccount?.name ?? '';
  };

  const getsSavingName = (id: number | null | undefined): string => {
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }>
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSubtext}>Let&apos;s look at your finances</Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.extendedIslandTable}>
            {transactions.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Transactions Logged</Text>
              </View>
            ) : (
              <View>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Transactions</Text>
                </View>
                <ScrollView
                  nestedScrollEnabled
                  contentContainerStyle={{ paddingBottom: 40 }}
                  style={{ flexGrow: 1 }}
                >
                  {transactions.map((transaction) => (
                    <View key={transaction.id} style={styles.cardTableRow}>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextLeft}>{transaction.name}:</Text>
                        <Text style={styles.cardRowTextLeft}>
                          ${transaction.amount} ({transaction.type})
                        </Text>
                      </View>
                      {transaction.credited_to != null && (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          <Text style={styles.cardRowTextRight}>
                            {getCreditName(transaction.credited_to)} Paid
                          </Text>
                          <Text style={styles.cardRowTextRight}>
                            {getReadableDate(transaction.transaction_date)}
                          </Text>
                        </View>
                      )}
                      {(transaction.withdrawn_from != null && transaction.deposited_to === null) && (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          <Text style={styles.cardRowTextRight}>
                            Paid From {getsSavingName(transaction.withdrawn_from)}
                          </Text>
                          <Text style={styles.cardRowTextRight}>
                            {getReadableDate(transaction.transaction_date)}
                          </Text>
                        </View>
                      )}
                      {(transaction.withdrawn_from != null && transaction.deposited_to != null) && (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          <Text style={styles.cardRowTextRight}>
                            {getsSavingName(transaction.withdrawn_from)} {'>'} {getsSavingName(transaction.deposited_to)}
                          </Text>
                          <Text style={styles.cardRowTextRight}>
                            {getReadableDate(transaction.transaction_date)}
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
            {allReccuring.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Reccurring Expenses Logged</Text>
              </View>
            ) : (
              <View>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Recurring Expenses</Text>
                </View>
                <ScrollView
                  nestedScrollEnabled
                  contentContainerStyle={{ paddingBottom: 40 }}
                  style={{ flexGrow: 1 }}
                >
                  {allReccuring.map((expense) => (
                    <View key={expense.id} style={styles.cardTableRow}>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                        <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextRight}>
                          Due {expense.reccurring_date}th
                        </Text>
                        {!expense.paid_for_month ? (
                          <TouchableOpacity style={styles.tablePayButton}>
                            <Text style={styles.tablePayButtonText}>Pay</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.cardRowTextRight}>Paid</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.islandTable}>
            {allPLanned.length === 0 ? (
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>No Planned Expenses Logged</Text>
              </View>
            ) : (
              <View>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Planned Expenses</Text>
                </View>
                <ScrollView
                  nestedScrollEnabled
                  contentContainerStyle={{ paddingBottom: 40 }}
                  style={{ flexGrow: 1 }}
                >
                  {allPLanned.map((expense) => (
                    <View key={expense.id} style={styles.cardTableRow}>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                        <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                      </View>
                      {!expense.paid ? (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          <Text style={styles.cardRowTextRight}>
                            {getReadableDate(expense.paid_date)}
                          </Text>
                          <TouchableOpacity style={styles.tablePayButton}>
                            <Text style={styles.tablePayButtonText}>Pay</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          {expense.credited_to != null && (
                            <Text style={styles.cardRowTextRight}>
                              {getCreditName(expense.credited_to)} Paid
                            </Text>
                          )}
                          {expense.withdrawn_from != null && (
                            <Text style={styles.cardRowTextRight}>
                              Paid from {getsSavingName(expense.withdrawn_from)}
                            </Text>
                          )}
                          <Text style={styles.cardRowTextRight}>
                            {getReadableDate(expense.paid_date)}
                          </Text>
                        </View>
                      )}
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


