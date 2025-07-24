import { styles } from '@/styles/global';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Text, TextInput } from 'react-native';
import FormField from './FormField';

export default function FormAmountField({ control, name, label, error }: {
  control: any;
  name: string;
  label?: string;
  error?: boolean;
}) {

  let labelValue = name;
  if (label != undefined) {
    labelValue = label
  }

  return (
    <FormField label={labelValue}>
      <Controller
        control={control}
        name={name}
        rules={{
          required: true,
          pattern: /^-?\d+(\.\d{1,2})?$/,
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
      { error && <Text style={styles.errorMessage}>Amount is required.</Text> }
    </FormField >
  );
}
