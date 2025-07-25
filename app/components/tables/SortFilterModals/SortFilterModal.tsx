import { modalStyles, styles } from '@/styles/global';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import actions from '../../actions';
import FormField from '../../forms/FormField';
import DatePickerInput from './DatePicker';

type SortFieldOption = 'name' | 'amount' | 'date' | 'paidStatus' | 'type';

interface FilterSortModalProps<T> {
    visible: boolean;
    data: T[];
    allData: T[];
    onApply: (result: T[]) => void;
    onCancel: () => void;
    amountField: keyof T;
    dateField: keyof T;
    typeField: keyof T;
    paidField?: keyof T;
    normalizeDate?: (value: any) => number;
}

interface FilterParams {
    type?: string;
    amountMin?: number;
    amountMax?: number;
    dateField?: keyof any;
    dateMin?: Date | string | number;
    dateMax?: Date | string | number;
}

export function FilterSortModal<T extends object>({
    visible,
    data,
    allData,
    onApply,
    onCancel,
    amountField,
    dateField,
    typeField,
    paidField,
    normalizeDate: normDate = actions.normalizeDate,
}: FilterSortModalProps<T>) {
    const [amountMin, amountMax] = useMemo(() => {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        allData.forEach(item => {
            const val = Number(item[amountField]);
            if (!isNaN(val)) {
                if (val < min) min = val;
                if (val > max) max = val;
            }
        });
        if (min === Number.POSITIVE_INFINITY) min = 0;
        if (max === Number.NEGATIVE_INFINITY) max = 0;
        return [min, max];
    }, [allData, amountField]);

    const [dateMin, dateMax] = useMemo(() => {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        allData.forEach(item => {
            const ts = normDate(item[dateField]);
            if (ts < min) min = ts;
            if (ts > max) max = ts;
        });
        if (min === Number.POSITIVE_INFINITY) min = Date.now();
        if (max === Number.NEGATIVE_INFINITY) max = Date.now();
        return [min, max];
    }, [allData, dateField, normDate]);

    const uniqueTypes = useMemo(() => {
        const set = new Set<string>();
        allData.forEach(item => {
            const val = item[typeField];
            if (typeof val === 'string' || typeof val === 'number') {
                set.add(String(val));
            }
        });
        return Array.from(set).sort();
    }, [allData, typeField]);

    const paidStatusExists = useMemo(() => {
        if (!paidField) return false;
        return allData.some(item => paidField in item);
    }, [allData, paidField]);

    const [filterAmountMin, setFilterAmountMin] = useState(amountMin);
    const [filterAmountMax, setFilterAmountMax] = useState(amountMax);
    const [filterDateMin, setFilterDateMin] = useState(new Date(dateMin));
    const [filterDateMax, setFilterDateMax] = useState(new Date(dateMax));
    const [filterType, setFilterType] = useState<string | undefined>(undefined);
    const [sortField, setSortField] = useState<SortFieldOption>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (visible && allData.length > 0) {
            if (filterAmountMin < amountMin) setFilterAmountMin(amountMin);
            if (filterAmountMin > filterAmountMax) setFilterAmountMin(filterAmountMax);

            if (filterAmountMax > amountMax) setFilterAmountMax(amountMax);
            if (filterAmountMax < filterAmountMin) setFilterAmountMax(filterAmountMin);

            setFilterDateMin(new Date(dateMin));
            setFilterDateMax(new Date(dateMax));
            setFilterType(undefined);
            setSortField('name');
            setSortOrder('asc');
        }
    }, [visible, allData, filterAmountMin, filterAmountMax, amountMin, amountMax, dateMin, dateMax]);

    function onApplyPress() {
        const filterParams: FilterParams = {
            type: filterType,
            amountMin: filterAmountMin,
            amountMax: filterAmountMax,
            dateField,
            dateMin: filterDateMin,
            dateMax: filterDateMax,
        };

        let filtered = actions.filterData(data, filterParams);
        const ascending = sortOrder === 'asc';

        let sortKey: keyof T;
        switch (sortField) {
            case 'amount':
                sortKey = amountField;
                break;
            case 'date':
                sortKey = dateField;
                break;
            case 'paidStatus':
                if (!paidField || !paidStatusExists) {
                    sortKey = 'name' as keyof T;
                } else {
                    sortKey = paidField;
                }
                break;
            case 'type':
                sortKey = typeField;
                break;
            default:
                sortKey = 'name' as keyof T;
        }

        filtered = actions.sortByField(filtered, sortKey, ascending);

        onApply(filtered);
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <Text style={styles.modalTitle}>Filter & Sort</Text>

                        <FormField label={`Amount Range ($${filterAmountMin.toFixed(2)} - $${filterAmountMax.toFixed(2)})`}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.input}
                                    value={filterAmountMin.toFixed(2)}
                                    onChangeText={text => {
                                        const val = parseFloat(text);
                                        if (!isNaN(val) && val <= filterAmountMax) setFilterAmountMin(Number(val.toFixed(2)));
                                    }}
                                />
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.input}
                                    value={filterAmountMax.toFixed(2)}
                                    onChangeText={text => {
                                        const val = parseFloat(text);
                                        if (!isNaN(val) && val >= filterAmountMin) setFilterAmountMax(Number(val.toFixed(2)));
                                    }}
                                />
                            </View>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={amountMin}
                                maximumValue={amountMax}
                                step={0.01}
                                value={filterAmountMin}
                                minimumTrackTintColor="#1EB1FC"
                                maximumTrackTintColor="#d3d3d3"
                                onSlidingComplete={val => {
                                    const clamped = Math.min(Math.max(val, amountMin), filterAmountMax);
                                    setFilterAmountMin(clamped);
                                }}
                            />
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={amountMin}
                                maximumValue={amountMax}
                                step={0.01}
                                value={filterAmountMax}
                                minimumTrackTintColor="#1EB1FC"
                                maximumTrackTintColor="#d3d3d3"
                                onSlidingComplete={val => {
                                    const clamped = Math.min(Math.max(val, filterAmountMin), amountMax);
                                    setFilterAmountMax(clamped);
                                }}
                            />
                        </FormField>

                        {(dateField === 'reccurring_date' || dateField === 'expected_date') ? (
                            <>
                                <FormField label="Recurring Day">
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={filterDateMin.getDate()}
                                            onValueChange={val => {
                                                setFilterDateMin(new Date(1970, 0, val));
                                                if (filterDateMax.getDate() < val) setFilterDateMax(new Date(1970, 0, val));
                                            }}
                                            mode="dropdown"
                                            style={modalStyles.pickerFlat}
                                            itemStyle={{
                                                color: 'white',
                                                fontFamily: 'Tektur',
                                                fontSize: 16
                                            }}
                                        >
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <Picker.Item key={day} label={`${day}`} value={day} />
                                            ))}
                                        </Picker>
                                    </View>
                                    <Text style={[styles.sectionLabel, { textAlign: 'center' }]}>to</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={filterDateMax.getDate()}
                                            onValueChange={val => {
                                                setFilterDateMax(new Date(1970, 0, val));
                                                if (filterDateMin.getDate() > val) setFilterDateMin(new Date(1970, 0, val));
                                            }}
                                            mode="dropdown"
                                            style={modalStyles.pickerFlat}
                                            itemStyle={{
                                                color: 'white',
                                                fontFamily: 'Tektur',
                                                fontSize: 16
                                            }}
                                        >
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <Picker.Item key={day} label={`${day}`} value={day} />
                                            ))}
                                        </Picker>
                                    </View>
                                </FormField>
                            </>
                        ) : (
                            <FormField label="Date Range">
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <DatePickerInput
                                        label="Start Date"
                                        date={filterDateMin}
                                        onChange={setFilterDateMin}
                                        minimumDate={new Date(dateMin)}
                                        maximumDate={filterDateMax}
                                    />
                                    <DatePickerInput
                                        label="End Date"
                                        date={filterDateMax}
                                        onChange={setFilterDateMax}
                                        minimumDate={filterDateMin}
                                        maximumDate={new Date(dateMax)}
                                    />
                                </View>
                            </FormField>
                        )}

                        <FormField label="Type">
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={filterType}
                                    onValueChange={setFilterType}
                                    mode="dropdown"
                                    style={modalStyles.pickerFlat}
                                    itemStyle={{
                                        color: 'white',
                                        fontFamily: 'Tektur',
                                        fontSize: 16
                                    }}
                                >
                                    <Picker.Item label="All Types" value={undefined} />
                                    {uniqueTypes.map(typeOption => (
                                        <Picker.Item key={typeOption} label={typeOption} value={typeOption} />
                                    ))}
                                </Picker>
                            </View>
                        </FormField>

                        <FormField label="Sort By">
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={sortField}
                                    onValueChange={v => setSortField(v as SortFieldOption)}
                                    mode="dropdown"
                                    style={modalStyles.pickerFlat}
                                    itemStyle={{
                                        color: 'white',
                                        fontFamily: 'Tektur',
                                        fontSize: 16
                                    }}
                                >
                                    <Picker.Item label="Name (A-Z)" value="name" />
                                    <Picker.Item label="Amount" value="amount" />
                                    <Picker.Item label="Date" value="date" />
                                    {paidStatusExists && <Picker.Item label="Paid Status" value="paidStatus" />}
                                    <Picker.Item label="Type" value="type" />
                                </Picker>
                            </View>
                        </FormField>

                        {/* Sort Order Buttons Row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                            <TouchableOpacity
                                style={[styles.sortOrderButton, sortOrder === 'asc' && styles.sortOrderButtonSelected]}
                                onPress={() => setSortOrder('asc')}
                            >
                                <Text style={sortOrder === 'asc' ? styles.sortOrderTextSelected : styles.sortOrderText}>Ascending</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sortOrderButton, sortOrder === 'desc' && styles.sortOrderButtonSelected]}
                                onPress={() => setSortOrder('desc')}
                            >
                                <Text style={sortOrder === 'desc' ? styles.sortOrderTextSelected : styles.sortOrderText}>Descending</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons Row - Vertically below */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: '#aaa' }]}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onApplyPress} style={[styles.button, { backgroundColor: '#1EB1FC' }]}>
                                <Text style={styles.buttonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
