import React from 'react';
import { Controller } from 'react-hook-form';
import RadioGroup from 'react-native-radio-buttons-group';
import FormField from './FormField';

interface Props {
  control: any;
  name: string;
  label: string;
  radioButtons: any[];
  setRadioButtons: (btns: any[]) => void;
}

export default function FormRadioGroup({ control, name, label, radioButtons, setRadioButtons }: Props) {
  return (
    <FormField label={label}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <RadioGroup
            radioButtons={radioButtons.map(rb => ({
              ...rb,
              selected: rb.value === value,
              labelStyle: {
                ...rb.labelStyle,
                color: rb.value === value ? '#aad1fa' : '#fff'
              }
            }))}
            onPress={(selectedId: string) => {
              const updated = radioButtons.map(rb => ({
                ...rb,
                selected: rb.id === selectedId
              }));
              setRadioButtons(updated);
              const selected = updated.find(rb => rb.selected);
              if (selected) onChange(selected.value);
            }}
            layout="row"
          />
        )}
      />
    </FormField>
  );
}
