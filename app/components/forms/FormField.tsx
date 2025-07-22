import { styles } from '@/styles/global';
import React from 'react';
import { Text, View } from 'react-native';

export default function FormField({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) {
  return (
    <View style={[styles.transFieldBlock, { marginBottom: 12 }]}>
      <Text style={styles.transLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.transErrorText}>{error}</Text> : null}
    </View>
  );
}