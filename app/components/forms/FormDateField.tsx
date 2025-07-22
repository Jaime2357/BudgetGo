import { styles } from '@/styles/global';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import FormField from './FormField';

export default function FormDateField({ control, name, showPicker, setShowPicker }: {
  control: any;
  name: string;
  showPicker: boolean;
  setShowPicker: (val: boolean) => void;
}) {
  return (
    <FormField label="Transaction Date">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View>
            <TouchableOpacity style={styles.transDateButton} onPress={() => setShowPicker(true)}>
              <Text style={styles.transDateButtonText}>
                {value ? new Date(value).toLocaleString() : 'Pick a date'}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={new Date(value || new Date())}
                mode="date"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowPicker(false);
                  if (e.type === 'set' && selectedDate) {
                    onChange(selectedDate);
                  }
                }}
              />
            )}
          </View>
        )}
      />
    </FormField>
  );
}
