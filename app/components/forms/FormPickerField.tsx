import { pickerStyles, styles } from '@/styles/global';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Text, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import FormField from './FormField';

interface Props {
  control: any;
  name: string;
  label: string;
  items: { label: string; value: number }[];
  placeholderLabel?: string;
}

export default function FormPickerField({ control, name, label, items, placeholderLabel = "Select Option" }: Props) {

  if (items.length === 0) {
    return (
      <FormField label={label}>
        <View style={styles.pickerContainer}>
          <Text style={{
            color: "white",
            paddingHorizontal: 14,
            paddingVertical: 8,
            fontFamily: "Tektur-Sub",
            fontSize: 16
          }}>
            No Options Available
          </Text>
        </View>
      </FormField>
    )
  }

  return (
    <FormField label={label}>
      <Controller
        control={control}
        name={name}
        rules={{ required: true }}
        render={({ field }) => (
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={field.onChange}
              items={items}
              value={field.value}
              placeholder={{ label: placeholderLabel, value: null }}
              style={pickerStyles}
            />
          </View>
        )}
      />
    </FormField>
  );
}
