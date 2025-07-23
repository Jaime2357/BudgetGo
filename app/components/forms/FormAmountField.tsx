import { styles } from '@/styles/global';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Text, TextInput } from 'react-native';
import FormField from './FormField';

export default function FormAmountField({ control, name, error }: {
  control: any;
  name: string;
  error?: boolean;
}) {
  return (
    <FormField label="Amount">
      <Controller
        control={control}
        name={name}
        rules={{
          required: true,
          pattern: /^\d+(\.\d{1,2})?$/,
          min: 0.01,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputField}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="decimal-pad"
            inputMode="decimal"
            value={String(value || '')}
            placeholder="Enter Amount"
            placeholderTextColor="#888"
          />
        )}
      />
      {error && <Text style={styles.errorMessage}>Amount is required.</Text>}
    </FormField>
  );
}
