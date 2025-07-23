import { styles } from '@/styles/global';
import { CreditAccount, SavingAccount, Transaction } from '@/types/typeDefs';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import actions, { getCreditName, getSavingName } from '../actions';
import EmptyListNotice from '../global/EmptyListNotice';

interface Props {
  transactions: Transaction[];
  credit: Map<number, CreditAccount>;
  saving: Map<number, SavingAccount>;
}

export default function TransactionList({ transactions, credit, saving }: Props) {
  if (transactions.length === 0) {
    return <EmptyListNotice message="No Transactions Logged" />;
  }

  return (
    <View style={styles.extendedTableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Transactions</Text>
      </View>
      <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }} style={{ flexGrow: 1 }}>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.tableRow}>
            <View style={{ flexDirection: 'column', width: '50%' }}>
              <Text style={styles.rowTextLeft}>{transaction.name}:</Text>
              <Text style={styles.rowTextLeft}>
                ${transaction.amount} ({transaction.type})
              </Text>
            </View>

            <View style={{ flexDirection: 'column', width: '50%' }}>
              {transaction.credited_to !== null && (
                <>
                  <Text style={styles.rowTextRight}>
                    {getCreditName(credit, transaction.credited_to)} Paid
                  </Text>
                  <Text style={styles.rowTextRight}>
                    {actions.getReadableDate(transaction.transaction_date)}
                  </Text>
                </>
              )}
              {transaction.withdrawn_from !== null && transaction.deposited_to === null && (
                <>
                  <Text style={styles.rowTextRight}>
                    Paid From {getSavingName(saving, transaction.withdrawn_from)}
                  </Text>
                  <Text style={styles.rowTextRight}>
                    {actions.getReadableDate(transaction.transaction_date)}
                  </Text>
                </>
              )}
              {transaction.withdrawn_from !== null && transaction.deposited_to !== null && (
                <>
                  <Text style={styles.rowTextRight}>
                    {getSavingName(saving, transaction.withdrawn_from)} {'>'} {getSavingName(saving, transaction.deposited_to)}
                  </Text>
                  <Text style={styles.rowTextRight}>
                    {actions.getReadableDate(transaction.transaction_date)}
                  </Text>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
