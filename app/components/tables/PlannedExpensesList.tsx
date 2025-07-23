import { styles } from '@/styles/global';
import { PlanExpenses } from '@/types/typeDefs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import actions from '../actions';
import EmptyListNotice from '../global/EmptyListNotice';

interface Props {
  data: PlanExpenses[];
  onPay: (entry: PlanExpenses) => void;
  creditMap?: Map<number, any>;
  savingMap?: Map<number, any>;
}

export default function PlannedExpensesList({ data, onPay, creditMap, savingMap }: Props) {
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
                  <TouchableOpacity onPress={() => onPay(expense)} style={styles.payButton}>
                    <Text style={styles.payButtonText}>Pay</Text>
                  </TouchableOpacity>
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
                </View>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
}
