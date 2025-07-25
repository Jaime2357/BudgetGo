import dataDrop from '@/app/database/dbDrop';
import { styles } from '@/styles/global';
import { CreditAccount, SavingAccount, Transaction } from '@/types/typeDefs';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import actions, { getCreditName, getSavingName } from '../actions';
import EmptyListNotice from '../global/EmptyListNotice';
import TableHeader from '../global/tableHeader';

interface Props {
  transactions: Transaction[];
  credit: Map<number, CreditAccount>;
  saving: Map<number, SavingAccount>;
  refreshOnDelete: () => void;
  onFilterPress: () => void;
}

export default function TransactionList({ transactions, credit, saving, refreshOnDelete, onFilterPress }: Props) {

  const [listedTransactions, setListedTransactions] = useState<Transaction[]>(transactions)

  useEffect(() => {
    setListedTransactions(transactions);
  }, [transactions]);

  function onSearch(searchQuery?: string) {

    const searchResults = actions.searchFilter(transactions, searchQuery);
    setListedTransactions(searchResults);
  }

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

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<keyof Transaction | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const onFilterChange = (newFilters: Record<string, any>) => {
  setFilters(newFilters);
  // Optionally trigger filtering here or debounce, etc.
};

const onSortChange = (field: keyof Transaction, order: 'asc' | 'desc') => {
  setSortField(field);
  setSortOrder(order);
  // Trigger sorting here
};


  if (transactions.length === 0) {
    return <EmptyListNotice message="No Transactions Logged" />;
  }

  return (
    <View style={styles.extendedTableContainer}>
      <TableHeader name='Transactions' onSearch={onSearch} onFilterPress={onFilterPress} />
      <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }} style={{ flexGrow: 1 }}>
        {listedTransactions.map((transaction) => (
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
