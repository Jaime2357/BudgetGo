import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CardCarousel from '../components/homeScreen/carouselComponent';
import initDB from '../database/dbInit';
import accountRequest, {
  CreditAccount,
  PlanExpenses,
  RecExpenses,
  RecIncome,
  SavingAccount,
} from '../database/dbReq';

export default function HomeScreen() {
  useEffect(() => {
    async function setupAndFetch() {
      await initDB();

      const saving = await accountRequest.getSaving();
      const credits = await accountRequest.getCredit();
      const recExpenses = await accountRequest.getRecExpenses();
      const planExpenses = await accountRequest.getPlanExpenses();
      const recIncome = await accountRequest.getRecIncome();

      setSavings(saving);
      setCredits(credits);
      setRecExpenses(recExpenses);
      setPlanExpenses(planExpenses);
      setRecIncome(recIncome);

      const thisMonth = new Date();
      const monthName = thisMonth.toLocaleString('default', { month: 'long' });
      setMonth(monthName);
    }
    setupAndFetch();
  }, []);

  const [savings, setSavings] = useState<SavingAccount[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [recExpenses, setRecExpenses] = useState<RecExpenses[]>([]);
  const [planExpenses, setPlanExpenses] = useState<PlanExpenses[]>([]);
  const [recIncome, setRecIncome] = useState<RecIncome[]>([]);
  const [month, setMonth] = useState<string>('January');

  const savingKeys = ['blue', 'red'];
  const creditKeys = ['bofa', 'venmo'];

  const savingsWithImages = savings.map((item, idx) => ({
    ...item,
    type: 'savings' as const,
    imageKey: savingKeys[idx % savingKeys.length],
  }));

  const creditWithImages = credits.map((item, idx) => ({
    ...item,
    type: 'credit' as const,
    imageKey: creditKeys[idx % creditKeys.length],
  }));

  function getReadableDate(date: Date) {
    const d = new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  return (
    // <ImageBackground
    //   source={imageMap['background']}
    //   style={{ flex: 1 }}
    //   resizeMode="cover"
    // >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1A3259' }} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollableContainer}
        >
          {/* 👋 Welcome message */}
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.welcomeSubtext}>Let&apos;s look at your finances</Text>
          </View>
          
          <View style={styles.contentContainer}>
            {/* 📦 Saving Accounts */}
            <View style={styles.islandBox}>
              {savings.length === 0 ? (
                <Text>No savings saved.</Text>
              ) : (
                <CardCarousel cardProp={savingsWithImages} />
              )}
            </View>

            {/* 💳 Credit Accounts */}
            <View style={styles.islandBox}>
              {credits.length === 0 ? (
                <Text>No credit cards saved.</Text>
              ) : (
                <CardCarousel cardProp={creditWithImages} />
              )}
            </View>

            {/* 🔁 Recurring Expenses */}
            <View style={styles.islandTable}>
              {recExpenses.length === 0 ? (
                <Text>No Expenses.</Text>
              ) : (
                <>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>{month} Expenses</Text>
                  </View>
                  {recExpenses.map((expense) => (
                    <View key={expense.id} style={styles.cardTableRow}>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                        <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextRight}>
                          Due {expense.reccurring_date}th
                        </Text>
                        <TouchableOpacity style={styles.tablePayButton}>
                          <Text style={styles.tablePayButtonText}>Pay</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>

            {/* 📅 Planned Expenses */}
            <View style={styles.islandTable}>
              {planExpenses.length === 0 ? (
                <Text>No Expenses.</Text>
              ) : (
                <>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>Planned Expenses</Text>
                  </View>
                  {planExpenses.map((expense) => (
                    <View key={expense.id} style={styles.cardTableRow}>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextLeft}>{expense.name}:</Text>
                        <Text style={styles.cardRowTextLeft}>${expense.amount}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextRight}>
                          {getReadableDate(expense.paid_date)}
                        </Text>
                        <TouchableOpacity style={styles.tablePayButton}>
                          <Text style={styles.tablePayButtonText}>Pay</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>

            {/* 💸 Recurring Income */}
            <View style={styles.islandTable}>
              {recIncome.length === 0 ? (
                <Text>No Income.</Text>
              ) : (
                <>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>Recurring Income</Text>
                  </View>
                  {recIncome.map((income) => (
                    <View key={income.id} style={styles.cardTableRow}>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextLeft}>{income.name}:</Text>
                        <Text style={styles.cardRowTextLeft}>${income.amount}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', width: '50%' }}>
                        <Text style={styles.cardRowTextRight}>
                          {income.expected_date}th
                        </Text>
                        {!income.received ? (
                          <TouchableOpacity style={styles.tablePayButton}>
                            <Text style={styles.tablePayButtonText}>Log</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.cardRowTextRight}>Received</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    // </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollableContainer: {
    paddingTop: 24,
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'black',
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
    paddingBottom: 20
  },
  welcomeHeader: {
    marginBottom: 25,
    paddingVertical: 13,
    fontFamily: 'Tektur-Sub',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Tektur',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#ccc',
  },
  islandBox: {
    backgroundColor: 'rgba(35, 35, 35, 0.9)',
    borderColor: 'rgba(74, 144, 226, 0.18)',
    borderWidth: 1,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginVertical: 17,
    width: '90%',
    aspectRatio: 1.5,
    overflow: 'hidden',
    padding: '5%',
  },
  islandTable: {
    backgroundColor: 'rgba(35, 35, 35, 0.9)',
    borderRadius: 30,
    marginVertical: 17,
    width: '90%',
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.18)',
  },
  cardHeaderText: {
    fontSize: 20,
    fontFamily: 'Tektur-Head',
    color: 'white',
  },
  cardTableRow: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomWidth: 1,
    width: '95%',
    borderBottomColor: 'white',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  cardRowTextLeft: {
    fontSize: 15,
    fontFamily: 'Tektur-Sub',
    color: 'white',
    marginVertical: 2,
  },
  cardRowTextRight: {
    fontSize: 15,
    fontFamily: 'Tektur-Sub',
    marginVertical: 2,
    color: 'white',
    textAlign: 'right',
  },
  tablePayButton: {
    paddingVertical: 2,
    marginVertical: 2,
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(74, 144, 226, 0.18)',
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  tablePayButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Tektur-Sub',
    textAlign: 'center',
  },
});
