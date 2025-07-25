import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Platform,
    StyleProp,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface DatePickerInputProps {
  label: string;
  date: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;

  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  date,
  onChange,
  minimumDate,
  maximumDate,
  containerStyle,
  buttonStyle,
  textStyle,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

  const minDateValid = minimumDate instanceof Date && !isNaN(minimumDate.getTime());
  const maxDateValid = maximumDate instanceof Date && !isNaN(maximumDate.getTime());

  let minDateToUse = minDateValid ? minimumDate : undefined;
  let maxDateToUse = maxDateValid ? maximumDate : undefined;

  if (minDateToUse && maxDateToUse && minDateToUse > maxDateToUse) {
    [minDateToUse, maxDateToUse] = [maxDateToUse, minDateToUse];
  }

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={[{ flex: 1, marginRight: label === 'Start Date' ? 8 : 0, maxWidth: '40%' }, containerStyle]}>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6}, buttonStyle]}
        activeOpacity={0.7}
      >
        <Text style={{ color: 'white', fontFamily: 'Tektur-Sub', fontSize: 15 }}>
          {label}: {safeDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={safeDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'default' : 'default'}
          onChange={onChangeDate}
          minimumDate={minDateToUse}
          maximumDate={maxDateToUse}
        />
      )}
    </View>
  );
};

export default DatePickerInput;
