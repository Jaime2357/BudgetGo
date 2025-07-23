import { styles } from '@/styles/global';
import { RecExpenses } from '@/types/typeDefs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import EmptyListNotice from '../global/EmptyListNotice';

interface Props {
  data: RecExpenses[];
  month?: string; // optional, used on HomeScreen
  onPay: (entry: RecExpenses) => void;
}

export default function RecurringExpensesList({ data, month, onPay }: Props) {
  return (
    <View style={styles.tableContainer}>
      {data.length === 0 ? (
        <EmptyListNotice message="No Monthly Expenses" />
      ) : (
        <>
          {month && (
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>{month} Expenses</Text>
            </View>
          )}
          {!month && (
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Recurring Expenses</Text>
            </View>
          )}
          {data.map((expense) => (
            <View key={expense.id} style={styles.tableRow}>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.rowTextLeft}>{expense.name}:</Text>
                <Text style={styles.rowTextLeft}>${expense.amount}</Text>
              </View>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.rowTextRight}>Due {expense.reccurring_date}th</Text>
                <TouchableOpacity onPress={() => onPay(expense)} style={styles.payButton}>
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
