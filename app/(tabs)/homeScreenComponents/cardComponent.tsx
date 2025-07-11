import { CardComponentProps } from '@/app/types';
import { useFonts } from 'expo-font';
import React from "react";
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { imageMap } from './imageMap';


interface CardProps {
  account: CardComponentProps;
}



const CardComponent: React.FC<CardProps> = ({ account }) => {
  const [loaded] = useFonts({
    'Tektur-Head': require('@/assets/fonts/Tektur/Tektur-Bold.ttf'),
    'Tektur-Sub': require('@/assets/fonts/Tektur/Tektur-Medium.ttf'),
    'Tektur': require('@/assets/fonts/Tektur/Tektur-Black.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      {account.type === 'savings' && (
        <>
          <ImageBackground
            source={imageMap[account.imageKey]}
            style={styles.cardBanner}>
            <Text style={styles.bannerText}>{account.name}</Text>
          </ImageBackground>
          <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.cardBodyHeading}>Balance</Text>
              <Text style={styles.cardBodyText}>${account.balance.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.cardBodyHeading}>Goal</Text>
              <Text style={styles.cardBodyText}>${account.threshold.toFixed(2)}</Text>
            </View>
          </View>
        </>
      )}
      {account.type === 'credit' && (
        <>
          <ImageBackground
            source={imageMap[account.imageKey]}
            style={styles.cardBanner}>
            <Text style={styles.bannerText}>{account.name}</Text>
          </ImageBackground>
          <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.cardBodyHeading}>Balance</Text>
              <Text style={styles.cardBodyText}>${account.current_balance.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.cardBodyHeading}>True Balance</Text>
              <Text style={styles.cardBodyText}>${account.true_balance.toFixed(2)}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  )
};

const CARD_WIDTH = 250;

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#232323',
    borderColor: '#7a8899',
    borderWidth: 0.5,
    overflow: 'hidden',
    marginRight: 16,
  },
  cardBanner: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 27,
    fontFamily: 'Tektur-Head',
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#00000080',
    padding: '5%',
    borderRadius: 8,
    alignSelf: 'flex-start',
    margin: 8,
  },
  infoRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  cardBodyHeading: {
    fontSize: 17,
    fontFamily: 'Tektur-Sub',
    color: 'white',
    textDecorationLine: 'underline',
    margin: 2
  },
  cardBodyText: {
    fontSize: 13,
    fontFamily: 'Tektur',
    color: 'white',
    margin: 2,
  }
});

export default CardComponent;