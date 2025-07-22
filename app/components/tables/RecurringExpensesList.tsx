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
    <View style={styles.islandTable}>
      {data.length === 0 ? (
        <EmptyListNotice message="No Monthly Expenses" />
      ) : (
        <>
          {month && (
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>{month} Expenses</Text>
            </View>
          )}
          {!month && (
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Recurring Expenses</Text>
            </View>
          )}
          {data.map((expense) => (
            <View key={expense.id} style={styles.cardTableRow}>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
              </View>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.cardRowTextRight}>Due {expense.reccurring_date}th</Text>
                <TouchableOpacity onPress={() => onPay(expense)} style={styles.tablePayButton}>
                  <Text style={styles.tablePayButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
