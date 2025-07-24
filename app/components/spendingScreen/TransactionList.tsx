import dataDrop from '@/app/database/dbDrop';
import { styles } from '@/styles/global';
import { CreditAccount, SavingAccount, Transaction } from '@/types/typeDefs';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import actions, { getCreditName, getSavingName } from '../actions';
import EmptyListNotice from '../global/EmptyListNotice';

interface Props {
  transactions: Transaction[];
  credit: Map<number, CreditAccount>;
  saving: Map<number, SavingAccount>;
  refreshOnDelete: () => void;
}

export default function TransactionList({ transactions, credit, saving, refreshOnDelete }: Props) {

  const onTransactionDelete = async (id: number) => {

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Reccurring Expense? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {

            try {
              await dataDrop.dropTransaction(id);
              Alert.alert('Success', 'Expense deleted successfully!', [
                { text: 'OK' },
              ]);
            } catch (e) {
              Alert.alert('Error', 'Something went wrong while deleting.');
            } finally {
              refreshOnDelete
            }
          },
        },
      ],
      { cancelable: false } // User must tap a button explicitly
    );
  }

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
              <TouchableOpacity
                onPress={() => onTransactionDelete(transaction.id)}
                style={[styles.tableButton, { backgroundColor: '#cc4444', alignSelf: 'flex-end' }]}
              >
                <Text style={[styles.tableButtonText, { color: 'white' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
