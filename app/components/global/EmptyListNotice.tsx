import { styles } from '@/styles/global';
import React from 'react';
import { Text, View } from 'react-native';

export default function EmptyListNotice({ message }: { message: string }) {
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.cardHeaderText}>{message}</Text>
    </View>
  );
}
