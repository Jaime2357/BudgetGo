import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import initDB from '../database/dbInit';
import accountRequest, { CreditAccount, PlanExpenses, RecExpenses, SavingAccount } from '../database/dbReq';


export default function SpendingScreen() {

  useEffect(() => {
    async function setupAndFetch() {

      await initDB(); // Ensure tables are created

      // Get all Table Data
      const credit = await accountRequest.getCredit();
      const saving = await accountRequest.getSaving();
      const allReccuring = await accountRequest.getAllRecurring();
      const allPLanned = await accountRequest.getAllPlanned();

      // Set all Table Data
      setCredit(credit);
      setSaving(saving);
      setAllReccuring(allReccuring);
      setAllPLanned(allPLanned)
    }
    setupAndFetch();
  }, []);

  const [credit, setCredit] = useState<CreditAccount[]>([]);
  const [saving, setSaving] = useState<SavingAccount[]>([])
  const [allReccuring, setAllReccuring] = useState<RecExpenses[]>([]);
  const [allPLanned, setAllPLanned] = useState<PlanExpenses[]>([])

  function getReadableDate(date: Date) {
    const d = new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  // console.log("Credits: ", allReccuring)
  // console.log("Expenses: ", allPLanned)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1E1E1E' }} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollableContainer}>

        <View style={styles.islandTable}>
          {allReccuring.length === 0 ? (
            <Text> No Expenses.</Text>
          ) : (
            <View>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Recurring Expenses</Text>
              </View>

              <ScrollView
                nestedScrollEnabled
                contentContainerStyle={{ paddingBottom: 40 }}
                style={{ flexGrow: 1 }}
              >
                {allReccuring.map((expense) => (
                  <View key={expense.id} style={styles.cardTableRow}>
                    <View style={{ flexDirection: 'column', width: '50%' }}>
                      <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                      <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', width: '50%' }}>
                      <Text style={styles.cardRowTextRight}>
                        Due {expense.reccurring_date}th
                      </Text>
                      {!expense.paid_for_month ? (
                        <TouchableOpacity
                          style={styles.tablePayButton}>
                          <Text style={styles.tablePayButtonText}>
                            Pay
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.cardRowTextRight}>
                          Paid
                        </Text>
                      )
                      }
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

          )}
        </View>

        <View style={styles.islandTable}>
          {allPLanned.length === 0 ? (
            <Text> No Expenses.</Text>
          ) : (
            <View>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Planned Expenses </Text>
              </View>

              <ScrollView
                nestedScrollEnabled
                contentContainerStyle={{ paddingBottom: 40 }}
                style={{ flexGrow: 1 }}
              >
                {allPLanned.map((expense) => (
                  <View key={expense.id} style={styles.cardTableRow}>
                    <View style={{ flexDirection: 'column', width: '50%' }}>
                      <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                      <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                    </View>

                    {!expense.paid ? (
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextRight}>
                          {getReadableDate(expense.paid_date)}
                        </Text>
                        <TouchableOpacity
                          style={styles.tablePayButton}>
                          <Text style={styles.tablePayButtonText}>
                            Pay
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        {expense.credited_to != null && (
                        <Text style={styles.cardRowTextRight}>
                          {credit[expense.credited_to].name} Paid
                        </Text>
                        )}
                        {expense.withdrawn_from != null && (
                        <Text style={styles.cardRowTextRight}>
                          Paid from {saving[expense.withdrawn_from].name}
                        </Text>
                        )}
                        <Text style={styles.cardRowTextRight}>
                          {getReadableDate(expense.paid_date)}
                        </Text>
                      </View>
                    )
                    }
                  </View>
                ))}
              </ScrollView>
            </View>

          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Fills the whole screen
  },
  scrollableContainer: {
    flexGrow: 1,
    //paddingTop: 40, // Offset below notification bar
    justifyContent: 'center', // Vertically center if content is short
    alignItems: 'center',
    paddingHorizontal: '10%',
    paddingVertical: 20, // For bottom nav bar
  },
  islandBox: {
    backgroundColor: '#232323',
    borderColor: 'rgba(74, 144, 226, 0.18)',
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginVertical: '5%',
    width: '90%',
    aspectRatio: 1.25,
    overflow: 'hidden',
    padding: '5%',
  },
  islandTable: {
    backgroundColor: '#232323',
    borderColor: 'rgba(74, 144, 226, 0.18)',
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginVertical: '5%',
    width: '90%',
    aspectRatio: 1.25,
    overflow: 'hidden'
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E1E1E',
    borderColor: '#7a8899',
    borderWidth: 0.5,
    borderRadius: 5,
    overflow: 'hidden'
  },
  cardBanner: {
    width: '100%',
    height: '60%',
    justifyContent: 'center'
  },
  cardHeader: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.18)'
  },
  cardTableRow: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomEndRadius: 1,
    width: '95%',
    borderBottomColor: 'white',
    alignSelf: 'center',
    flexDirection: 'row'
  },
  cardHeaderText: {
    fontSize: 20,
    fontFamily: 'Tektur-Head',
    color: 'white'
  },
  cardRowTextLeft: {
    fontSize: 15,
    fontFamily: 'Tektur-Sub',
    color: 'white',
    marginVertical: 2
  },
  cardRowTextRight: {
    fontSize: 15,
    fontFamily: 'Tektur-Sub',
    marginVertical: 2,
    color: 'white',
    textAlign: 'right',
  },
  bannerText: {
    fontSize: 30,
    fontFamily: 'Tektur-Head',
    backgroundColor: '#000000c0',
    color: 'white',
    alignSelf: 'flex-start',
    //width: '50%',
    padding: '5%'
  },
  cardBodyHeading: {
    fontSize: 20,
    fontFamily: 'Tektur-Sub',
    color: 'white',
    textDecorationLine: 'underline',
    margin: 2,
  },
  cardBodyText: {
    fontSize: 15,
    fontFamily: 'Tektur',
    color: 'white',
    margin: 2,
  },
  tablePayButton: {
    paddingVertical: 2,
    marginVertical: 2,
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(74, 144, 226, 0.18)',
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'flex-end'
  },
  tablePayButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Tektur-Sub',
    textAlign: 'center',
    justifyContent: 'center'
  }
});
