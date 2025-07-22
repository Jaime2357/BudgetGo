import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/global';
import { CreditAccount, PlanExpenses, RecExpenses, SavingAccount, Transaction } from '@/types/typeDefs';
import actions, { getCreditName, getSavingName } from '../components/actions';
import PaySingle from '../components/payButtons/spendModal';
import PayRec from '../components/recPayButtons/recSpendModal';
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
    setSavingNames(savings.map(acc => ({ label: acc.name, value: acc.id })));
    setCreditNames(credits.map(acc => ({ label: acc.name, value: acc.id })));
  }

  const [credit, setCredit] = useState<Map<number, CreditAccount>>(new Map());
  const [saving, setSaving] = useState<Map<number, SavingAccount>>(new Map());
  const [allReccuring, setAllReccuring] = useState<RecExpenses[]>([]);
  const [allPLanned, setAllPLanned] = useState<PlanExpenses[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingNames, setSavingNames] = useState<{ label: string; value: number }[]>([]);
  const [creditNames, setCreditNames] = useState<{ label: string; value: number }[]>([]);

  const [refreshing, setRefreshing] = useState(false);
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
                            {getCreditName(credit, transaction.credited_to)} Paid
                          </Text>
                          <Text style={styles.cardRowTextRight}>
                            {actions.getReadableDate(transaction.transaction_date)}
                          </Text>
                        </View>
                      )}
                      {(transaction.withdrawn_from != null && transaction.deposited_to === null) && (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          <Text style={styles.cardRowTextRight}>
                            Paid From {getSavingName(saving, transaction.withdrawn_from)}
                          </Text>
                          <Text style={styles.cardRowTextRight}>
                            {actions.getReadableDate(transaction.transaction_date)}
                          </Text>
                        </View>
                      )}
                      {(transaction.withdrawn_from != null && transaction.deposited_to != null) && (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          <Text style={styles.cardRowTextRight}>
                            {getSavingName(saving, transaction.withdrawn_from)} {'>'} {getSavingName(saving, transaction.deposited_to)}
                          </Text>
                          <Text style={styles.cardRowTextRight}>
                            {actions.getReadableDate(transaction.transaction_date)}
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
                          <TouchableOpacity
                            onPress={() => openRecModal(expense)}
                            style={styles.tablePayButton}>
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
                            {actions.getReadableDate(expense.paid_date)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => openPlanModal(expense)}
                            style={styles.tablePayButton}>
                            <Text style={styles.tablePayButtonText}>Pay</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'column', width: '50%' }}>
                          {expense.credited_to != null && (
                            <Text style={styles.cardRowTextRight}>
                              {getCreditName(credit, expense.credited_to)} Paid
                            </Text>
                          )}
                          {expense.withdrawn_from != null && (
                            <Text style={styles.cardRowTextRight}>
                              Paid from {getSavingName(saving, expense.withdrawn_from)}
                            </Text>
                          )}
                          <Text style={styles.cardRowTextRight}>
                            {actions.getReadableDate(expense.paid_date)}
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
            onRefresh();  // refresh the recurring expenses list
          }}
          savingOptions={savingNames}
          creditOptions={creditNames}
          savingMap={saving}
          creditMap={credit}
        />
      )}

    </SafeAreaView >
  );
}


