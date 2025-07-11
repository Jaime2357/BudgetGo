import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import initDB from '../database/dbInit';
import accountRequest, { CreditAccount, SavingAccount } from '../database/dbReq';
import CardCarousel from './homeScreenComponents/carouselComponent';
//import accountService from '../database/SQLiteService';

export default function HomeScreen() {

  useEffect(() => {
    async function setupAndFetch() {
      console.log("start")

      await initDB(); // Ensure tables are created
      //await accountService.insertAccount("Saving", 1000.92, 1200, 2); // Insert account
      console.log("done")
      const saving = await accountRequest.getSaving();
      const credits = await accountRequest.getCredit();
      setSavings(saving);
      setCredits(credits);
    }
    setupAndFetch();
  }, []);

  const [savings, setSavings] = useState<SavingAccount[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);

  const savingKeys = ['blue', 'red'];
  const creditKeys = ['bofa', 'venmo'];

  const savingsWithImages = savings.map((item, idx) => ({
    ...item,
    type: 'savings' as const,
    imageKey: savingKeys[idx % savingKeys.length], // Cycles through keys
  }));

  const creditWithImages = credits.map((item, idx) => ({
    ...item,
    type: 'credit' as const,
    imageKey: creditKeys[idx % creditKeys.length], // Cycles through keys
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1E1E1E' }} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollableContainer}>

        <View style={styles.islandBox}>
          {savings.length === 0 ? (
            <Text>No savings saved.</Text>
          ) : (
            <CardCarousel cardProp={savingsWithImages} />
          )}
        </View>

        <View style={styles.islandBox}>
          {credits.length === 0 ? (
            <Text>No credit cards saved.</Text>
          ) : (
            <CardCarousel cardProp={creditWithImages} />
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
    marginVertical: '10%',
    width: '85%',
    aspectRatio: 1.25,
    overflow: 'hidden',
    padding: '5%',
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
  }
});