import dataDrop from '@/app/database/dbDrop';
import { styles } from '@/styles/global';
import { PlanExpenses } from '@/types/typeDefs';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import actions from '../actions';
import EmptyListNotice from '../global/EmptyListNotice';

interface Props {
  data: PlanExpenses[];
  onPay: (entry: PlanExpenses) => void;
  creditMap?: Map<number, any>;
  savingMap?: Map<number, any>;
  refreshOnDelete: () => void;
}

export default function PlannedExpensesList({ data, onPay, creditMap, savingMap, refreshOnDelete }: Props) {

  const onPlanExpenseDelete = async (id: number) => {

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
              await dataDrop.dropPlanExpense(id);
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

  return (
    <View style={styles.tableContainer}>
      {data.length === 0 ? (
        <EmptyListNotice message="No Planned Expenses" />
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Planned Expenses</Text>
          </View>
          {data.map((expense) => (
            <View key={expense.id} style={styles.tableRow}>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.rowTextLeft}>{expense.name}:</Text>
                <Text style={styles.rowTextLeft}>${expense.amount}</Text>
              </View>
              {!expense.paid ? (
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.rowTextRight}>{actions.getReadableDate(expense.paid_date)}</Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
                    {/* Pay Button */}
                    <TouchableOpacity
                      onPress={() => onPay(expense)}
                      style={styles.tableButton}
                    >
                      <Text style={styles.tableButtonText}>Pay</Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() => onPlanExpenseDelete(expense.id)}
                      style={[styles.tableButton, { backgroundColor: '#cc4444' }]}
                    >
                      <Text style={[styles.tableButtonText, { color: 'white' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              ) : (
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  {expense.credited_to != null && (
                    <Text style={styles.rowTextRight}>
                      {creditMap ? creditMap.get(expense.credited_to)?.name ?? '' : ''} Paid
                    </Text>
                  )}
                  {expense.withdrawn_from != null && (
                    <Text style={styles.rowTextRight}>
                      Paid from {savingMap ? savingMap.get(expense.withdrawn_from)?.name ?? '' : ''}
                    </Text>
                  )}
                  <Text style={styles.rowTextRight}>{actions.getReadableDate(expense.paid_date)}</Text>

                  <TouchableOpacity
                    onPress={() => onPlanExpenseDelete(expense.id)}
                    style={[styles.tableButton, { alignSelf: 'flex-end', backgroundColor: '#cc4444' }]}
                  >
                    <Text style={[styles.tableButtonText, { color: 'white' }]}>Delete</Text>
                  </TouchableOpacity>

                </View>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
}
