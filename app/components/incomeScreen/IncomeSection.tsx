import { styles } from '@/styles/global';
import { Income, RecIncome, SavingAccount } from '@/types/typeDefs';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import actions, { getSavingName } from '../actions';

type IncomeSectionProps = {
  title: string;
  data: (Income | RecIncome)[];
  refData: Map<number, SavingAccount>;
  recurring?: boolean;
};

export default function IncomeSection({ title, data, refData, recurring = false }: IncomeSectionProps) {

  return (
    <View style={styles.islandTable}>
      {data.length === 0 ? (
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>No {title}</Text>
        </View>
      ) : (
        <View>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{title}</Text>
          </View>
          <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }} style={{ flexGrow: 1 }}>
            {data.map((item, idx) => (
              <View key={item.id ?? idx} style={styles.cardTableRow}>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.cardRowTextLeft}>{item.name}:</Text>
                  <Text style={styles.cardRowTextLeft}>${item.amount}{item.type ? ` (${item.type})` : ''}</Text>
                </View>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  {recurring && 'expected_date' in item ? (
                    <Text style={styles.cardRowTextRight}>{item.expected_date}th</Text>
                  ) : (
                    <Text style={styles.cardRowTextRight}>{getSavingName(refData ,item.deposited_to)}</Text>
                  )}
                  {item.received ? (
                    <Text style={styles.cardRowTextRight}>
                      {'paid_date' in item && item.paid_date ? actions.getReadableDate(item.paid_date) : ''}
                    </Text>
                  ) : (
                    !recurring && 'paid_date' in item ? (
                      <TouchableOpacity
                        style={styles.tablePayButton}
                        onPress={() => actions.handleLogClick(item.amount, item.deposited_to, 'income', Number(item.id))}
                      >
                        <Text style={styles.tablePayButtonText}>Log</Text>
                      </TouchableOpacity>
                    ) : (
                      recurring && 'expected_date' in item ? (
                        <TouchableOpacity
                          style={styles.tablePayButton}
                          onPress={() => actions.handleLogClick(item.amount, item.deposited_to, 'reccurring_income', Number(item.id))}
                        >
                          <Text style={styles.tablePayButtonText}>Log</Text>
                        </TouchableOpacity>
                      ) : null
                    )
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
