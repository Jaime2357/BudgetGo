import { styles } from '@/styles/global';
import React from 'react';
import { Text, View } from 'react-native';

export default function FormField({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) {
  return (
    <View style={[styles.formFieldBlock, { marginBottom: 12 }]}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
    </View>
  );
}