import { styles } from '@/styles/global';
import { RecExpenses } from '@/types/typeDefs';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import EmptyListNotice from '../global/EmptyListNotice';

import dataDrop from '@/app/database/dbDrop';
import actions from '../actions';
import TableHeader from '../global/tableHeader';

interface Props {
  data: RecExpenses[];
  month?: string; // optional, used on HomeScreen
  onPay: (entry: RecExpenses) => void;
  refreshOnDelete: () => void;
  onFilterPress: () => void;
}

export default function RecurringExpensesList({ data, month, onPay, refreshOnDelete, onFilterPress }: Props) {

  const [listedRecExpenses, setListedRecExpenses] = useState<RecExpenses[]>(data)

  useEffect(() => {
    setListedRecExpenses(data);
  }, [data]);

  function onSearch(searchQuery?: string) {

    const searchResults = actions.searchFilter(data, searchQuery);
    setListedRecExpenses(searchResults);
  }

  const onRecExpenseDelete = async (id: number) => {

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Reccurring Expense? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Optional: do nothing or log cancel
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {

            try {
              await dataDrop.dropRecExpense(id)
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
  };

  return (
    <View style={styles.tableContainer}>
      {data.length === 0 ? (
        <EmptyListNotice message="No Monthly Expenses" />
      ) : (
        <>
          {month && (
            <TableHeader name={month + ' Expenses'} onSearch={onSearch} onFilterPress={onFilterPress}/>
          )}
          {!month && (
            <TableHeader name='Reccurring Expenses' onSearch={onSearch} onFilterPress={onFilterPress}/>
          )}
          {listedRecExpenses.map((expense) => (
            <View key={expense.id} style={styles.tableRow}>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.rowTextLeft}>{expense.name}:</Text>
                <Text style={styles.rowTextLeft}>${expense.amount}</Text>
              </View>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.rowTextRight}>
                  Due {expense.reccurring_date}{actions.getOrdinalSuffix(expense.reccurring_date)}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>

                  {/* Pay Button */}
                  {!expense.paid_for_month && (
                    < TouchableOpacity
                      onPress={() => onPay(expense)}
                      style={styles.tableButton}
                    >
                      <Text style={styles.tableButtonText}>Pay</Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => onRecExpenseDelete(expense.id)}
                    style={[styles.tableButton, { backgroundColor: '#cc4444' }]}
                  >
                    <Text style={[styles.tableButtonText, { color: 'white' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          ))}
        </>
      )
      }
    </View >
  );
}
