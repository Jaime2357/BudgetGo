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
    <View style={styles.islandTable}>
      {data.length === 0 ? (
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>No {title}</Text>
        </View>
      ) : (
        <>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{title}</Text>
          </View>
          <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }} style={{ flexGrow: 1 }}>
            {data.map((income) => (
              <View key={income.id} style={styles.cardTableRow}>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.cardRowTextLeft}>{income.name}:</Text>
                  <Text style={styles.cardRowTextLeft}>
                    ${income.amount} {income.type ? `(${income.type})` : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.cardRowTextRight}>{income.expected_date}th</Text>
                  {income.received ? (
                    <Text style={styles.cardRowTextRight}>Received</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.tablePayButton}
                      onPress={() =>
                        actions.handleLogClick(
                          income.amount,
                          income.deposited_to,
                          'reccurring_income',
                          Number(income.id)
                        )
                      }
                    >
                      <Text style={styles.tablePayButtonText}>Log</Text>
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
