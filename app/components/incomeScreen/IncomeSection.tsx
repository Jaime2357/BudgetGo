import { styles } from '@/styles/global';
import { Income, RecIncome } from '@/types/typeDefs';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import dataDrop from '@/app/database/dbDrop';
import actions from '../actions';

type IncomeSectionProps = {
  title: string;
  data: (Income | RecIncome)[];
  refreshOnDelete: () => void;
};

export default function IncomeSection({ title, data, refreshOnDelete }: IncomeSectionProps) {

  const onTransactionDelete = async (id: number) => {

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Income? This action cannot be undone.',
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
              await dataDrop.dropIncome(id);
              Alert.alert('Success', 'Income deleted successfully!', [
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
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>No {title}</Text>
        </View>
      ) : (
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>{title}</Text>
          </View>
          <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }} style={{ flexGrow: 1 }}>
            {data.map((item, idx) => (
              <View key={item.id ?? idx} style={styles.tableRow}>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.rowTextLeft}>{item.name}:</Text>
                  <Text style={styles.rowTextLeft}>${item.amount}{item.type ? ` (${item.type})` : ''}</Text>
                </View>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  {item.received ? (
                    <View>
                      <Text style={styles.rowTextRight}>
                        {'paid_date' in item && item.paid_date ? actions.getReadableDate(item.paid_date) : ''}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onTransactionDelete(item.id)}
                        style={[styles.tableButton, { backgroundColor: '#cc4444', alignSelf: 'flex-end' }]}
                      >
                        <Text style={[styles.tableButtonText, { color: 'white' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (

                    <View>
                      
                      <Text style={styles.rowTextRight}>
                        {'paid_date' in item && item.paid_date ? actions.getReadableDate(item.paid_date) : ''}
                      </Text>

                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>

                        {/* Log Button */}
                        <TouchableOpacity
                          style={styles.tableButton}
                          onPress={() => actions.handleLogClick(item.amount, item.deposited_to, 'income', Number(item.id))}
                        >
                          <Text style={styles.tableButtonText}>Log</Text>
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity
                          onPress={() => onTransactionDelete(item.id)}
                          style={[styles.tableButton, { backgroundColor: '#cc4444' }]}
                        >
                          <Text style={[styles.tableButtonText, { color: 'white' }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

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
