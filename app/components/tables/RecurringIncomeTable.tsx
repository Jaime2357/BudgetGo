import dataDrop from '@/app/database/dbDrop';
import { styles } from '@/styles/global';
import { RecIncome, SavingAccount } from '@/types/typeDefs';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import actions from '../actions';
import EmptyListNotice from '../global/EmptyListNotice';
import TableHeader from '../global/tableHeader';

type RecurringIncomeTableProps = {
  data: RecIncome[];
  refData: Map<number, SavingAccount>;
  title?: string; // Optional custom title
  refreshOnDelete: () => void;
  onFilterPress: () => void;
};

export default function RecurringIncomeTable({
  data,
  refData,
  title = 'Recurring Income',
  refreshOnDelete,
  onFilterPress
}: RecurringIncomeTableProps) {

  const [listedRecIncome, setListedRecIncome] = useState<RecIncome[]>(data)

  useEffect(() => {
    setListedRecIncome(data);
  }, [data]);

  function onSearch(searchQuery?: string) {

    const searchResults = actions.searchFilter(data, searchQuery);
    setListedRecIncome(searchResults);
  }

  const onRecIncomeDelete = async (id: number) => {

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Reccurring Income? This action cannot be undone.',
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
              await dataDrop.dropRecIncome(id)
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
  };

  return (
    <View style={styles.tableContainer}>
      {data.length === 0 ? (
        <EmptyListNotice message="No Monthly Income" />
      ) : (
        <>
          <TableHeader name="Reccurring Income" onSearch={onSearch} onFilterPress={onFilterPress}/>
          <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }} style={{ flexGrow: 1 }}>
            {listedRecIncome.map((income) => (
              <View key={income.id} style={styles.tableRow}>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  <Text style={styles.rowTextLeft}>{income.name}:</Text>
                  <Text style={styles.rowTextLeft}>
                    ${income.amount} {income.type ? `(${income.type})` : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'column', width: '50%' }}>
                  {income.received ? (
                    <View>
                      <Text style={styles.rowTextRight}>
                        Received {income.expected_date}{actions.getOrdinalSuffix(income.expected_date)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onRecIncomeDelete(income.id)}
                        style={[styles.tableButton, { backgroundColor: '#cc4444', alignSelf: 'flex-end' }]}
                      >
                        <Text style={[styles.tableButtonText, { color: 'white' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.rowTextRight}>
                        {income.expected_date}{actions.getOrdinalSuffix(income.expected_date)}
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
                        {/* Log Button */}
                        <TouchableOpacity
                          style={styles.tableButton}
                          onPress={() =>
                            actions.handleLogClick(
                              income.amount,
                              income.deposited_to,
                              'reccurring_income',
                              Number(income.id)
                            )
                          }
                        >
                          <Text style={styles.tableButtonText}>Log</Text>
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity
                          onPress={() => onRecIncomeDelete(income.id)}
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
        </>
      )}
    </View>
  );
}
