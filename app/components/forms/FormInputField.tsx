import { styles } from '@/styles/global';
import React from 'react';
import { Controller } from 'react-hook-form';
import { TextInput } from 'react-native';
import FormField from './FormField';

export default function FormInputField({ control, name, label, placeholder }: {
  control: any;
  name: string;
  label: string;
  placeholder: string;
}) {
  return (
    <FormField label={label}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.transInput}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#888"
          />
        )}
      />
    </FormField>
  );
}
