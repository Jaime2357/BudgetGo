import { styles } from '@/styles/global';
import { RecIncome, SavingAccount } from '@/types/typeDefs';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import actions from '../actions';

type RecurringIncomeTableProps = {
  data: RecIncome[];
  refData: Map<number, SavingAccount>;
  title?: string; // Optional custom title
};

export default function RecurringIncomeTable({
  data,
  refData,
  title = 'Recurring Income',
}: RecurringIncomeTableProps) {
  return (
    <View style={styles.tableContainer}>
      {data.length === 0 ? (
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>No {title}</Text>
        </View>
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>{title}</Text>
          </View>
          <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }} style={{ flexGrow: 1 }}>
            {data.map((income) => (
              <View key={income.id} style={styles.tableRow}>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.rowTextLeft}>{income.name}:</Text>
                  <Text style={styles.rowTextLeft}>
                    ${income.amount} {income.type ? `(${income.type})` : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.rowTextRight}>{income.expected_date}th</Text>
                  {income.received ? (
                    <Text style={styles.rowTextRight}>Received</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() =>
                        actions.handleLogClick(
                          income.amount,
                          income.deposited_to,
                          'reccurring_income',
                          Number(income.id)
                        )
                      }
                    >
                      <Text style={styles.payButtonText}>Log</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
