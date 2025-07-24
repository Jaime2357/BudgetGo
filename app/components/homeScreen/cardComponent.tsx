import { CardComponentProps } from '@/types/typeDefs';
import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { imageMap } from '../../../assets/images/imageMap';

interface CardProps {
  account: CardComponentProps;
  onAdd?: () => void;
  onEdit?: () => void;
}

const CardComponent: React.FC<CardProps> = ({ account, onAdd, onEdit }) => {

  if (account.type === 'add') {
    return (
      <TouchableOpacity style={[styles.cardContainer, styles.addCardContainer]} onPress={onAdd}>
        <View style={styles.addIconWrapper}>
          <Ionicons name="add" size={48} color="#888" />
          <Text style={styles.addCardText}>Add Card</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.cardContainer}>

      {(account.type === 'savings' || account.type === 'credit') && onEdit && (
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      )}

      {account.type === 'savings' && (
        <>
          <ImageBackground
            source={account.image_uri
              ? { uri: account.image_uri }
              : imageMap[account.imageKey || 'blue']}
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
            source={account.image_uri
              ? { uri: account.image_uri }
              : imageMap[account.imageKey || 'blue']}
            style={styles.cardBanner}>
            <Text style={styles.bannerText}>{account.name}</Text>
          </ImageBackground>
          <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.cardBodyHeading}>Balance</Text>
              <Text style={styles.cardBodyText}>${
                (Number(account.current_balance) - account.pending_charges).toFixed(2)
              }</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.cardBodyHeading}>True Balance</Text>
              <Text style={styles.cardBodyText}>${account.current_balance.toFixed(2)}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  )
};

const CARD_WIDTH = 340;

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: 215,
    borderRadius: 12,
    backgroundColor: '#232323',
    borderColor: '#7a8899',
    borderWidth: 0.5,
    overflow: 'hidden',
    marginRight: 16,
  },
  cardBanner: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 28,
    fontFamily: 'Tektur-Head',
    color: 'white',
    backgroundColor: '#000000be',
    padding: '5%',
    borderRadius: 8,
    alignSelf: 'flex-start',
    margin: 8,
    maxWidth: '85%'
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
    fontSize: 18,
    fontFamily: 'Tektur-Sub',
    color: 'white',
    textDecorationLine: 'underline',
    margin: 2
  },
  cardBodyText: {
    fontSize: 15,
    fontFamily: 'Tektur-Sub',
    color: 'white',
    margin: 2,
  },
  addCardContainer: {
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A3259',
  },
  addIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    color: '#bbb',
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'Tektur-Sub',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#00000080',
    borderRadius: 16,
    padding: 4,
  },
});

export default CardComponent;