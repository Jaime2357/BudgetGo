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
    <View style={styles.islandTable}>
      {data.length === 0 ? (
        <EmptyListNotice message="No Planned Expenses" />
      ) : (
        <>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Planned Expenses</Text>
          </View>
          {data.map((expense) => (
            <View key={expense.id} style={styles.cardTableRow}>
              <View style={{ flexDirection: 'column', width: '50%' }}>
                <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
              </View>
              {!expense.paid ? (
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.cardRowTextRight}>{actions.getReadableDate(expense.paid_date)}</Text>
                  <TouchableOpacity onPress={() => onPay(expense)} style={styles.tablePayButton}>
                    <Text style={styles.tablePayButtonText}>Pay</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  {expense.credited_to != null && (
                    <Text style={styles.cardRowTextRight}>
                      {creditMap ? creditMap.get(expense.credited_to)?.name ?? '' : ''} Paid
                    </Text>
                  )}
                  {expense.withdrawn_from != null && (
                    <Text style={styles.cardRowTextRight}>
                      Paid from {savingMap ? savingMap.get(expense.withdrawn_from)?.name ?? '' : ''}
                    </Text>
                  )}
                  <Text style={styles.cardRowTextRight}>{actions.getReadableDate(expense.paid_date)}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
}
