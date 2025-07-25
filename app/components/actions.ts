import { router } from "expo-router";
import { Alert } from "react-native";


import { CreditAccount, SavingAccount } from "@/types/typeDefs";
import dataPost from '../database/dbPost';

// Date helper functions
const getReadableDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
};

export function convertDate(date: Date): string {
    // Ensure it's a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid Date object passed to convertDateToSQLiteFormat');
    }

    const pad = (d: number) => d.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    // Final SQLite-compatible date string: 'YYYY-MM-DD HH:MM:SS'
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}


function getFullDate(day: number) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    return dateString;
}

// Table button handlers

async function handleLogClick(amount: number, deposited_to: number, type: string, id: number) {
    await dataPost.postDeposit(amount, deposited_to, type, id);
    Alert.alert("Success", "Income posted successfully!", [
        {
            text: "OK",
            onPress: () => router.replace('/'),
        },
    ], { cancelable: false });
}

// Account Name Getters 

export const getCreditName = (credit: Map<number, CreditAccount>, id?: number | null) =>
    id ? credit.get(id)?.name ?? '' : '';

export const getSavingName = (saving: Map<number, SavingAccount>, id?: number | null) =>
    id ? saving.get(id)?.name ?? '' : '';

// Get Ordinal Suffix

export function getOrdinalSuffix(n: number) {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) return 'th';
    switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Get Time of Day Identifier
export function getTimeOfDay() {

    const today = new Date();
    const time = today.getHours();

    if (time >= 0 && time <= 11) {
        return 'Morning';
    }
    else if (time >= 12 && time <= 17) {
        return 'Afternoon';
    }
    else {
        return 'Evening';
    }
}

// Search, Sort and Filter helpers

export function searchFilter<Data extends { name: string }>(
    data: Data[],
    query?: string
): Data[] {
    if (!query) return data;

    const lowercaseQuery = query.toLowerCase();

    return data.filter(item =>
        item.name.toLowerCase().includes(lowercaseQuery)
    )
}

export function normalizeDate(value: any): number {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();

    if (typeof value === 'number') {
        // day of month (1-31) to fixed epoch date
        if (value > 0 && value <= 31) {
            return new Date(1970, 0, value).getTime();
        }
        // assume timestamp in ms
        return value;
    }

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

interface FilterParams {
  type?: string;
  amountMin?: number;
  amountMax?: number;
  dateField?: keyof any;
  dateMin?: Date | string | number;
  dateMax?: Date | string | number;
}


function filterData<D extends object>(data: D[], filters: FilterParams): D[] {
  const {
    type,
    amountMin,
    amountMax,
    dateField,
    dateMin,
    dateMax,
  } = filters;

  return data.filter(item => {
    if (type && (item as any).type !== type) return false;

    const amount = Number((item as any).amount);
    if (isNaN(amount)) return false;
    if (amountMin !== undefined && amount < amountMin) return false;
    if (amountMax !== undefined && amount > amountMax) return false;

    if (dateField && (item as any)[dateField] !== undefined) {
      const itemDate = normalizeDate((item as any)[dateField]);
      const minTimestamp = dateMin ? normalizeDate(dateMin) : -Infinity;
      const maxTimestamp = dateMax ? normalizeDate(dateMax) : Infinity;
      if (itemDate < minTimestamp || itemDate > maxTimestamp) return false;
    }

    return true;
  });
}



export function sortByField<D>(
    data: D[],
    field: keyof D,
    ascending: boolean
): D[] {

    const normalizeDate = (value: any): number => {
        if (value === undefined || value === null) return 0;

        if (value instanceof Date) {
            return value.getTime();
        }

        if (typeof value === 'number') {

            if (value > 0 && value <= 31) {
                return new Date(1970, 0, value).getTime();
            }
            return value;
        }

        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        }

        return 0;
    }

    const compare = (a: any, b: any): number => {
        if (a === null && b === null) return 0;
        if (a === null) return -1;
        if (b === null) return 1;

        if (field === 'reccurring_date') {
            if (typeof a === 'number' && typeof b === 'number') {
                return a - b;
            }
            // Fallback to normalized dates if types differ
            const aDate = normalizeDate(a);
            const bDate = normalizeDate(b);
            return aDate - bDate;
        }


        if (field.toString().toLowerCase().includes('date')
            || field === 'expected_date'
            || field === 'paid_date' || field === 'transaction_date') {
            const aDate = normalizeDate(a);
            const bDate = normalizeDate(b);
            return aDate - bDate;
        }


        if (typeof a === 'boolean' && typeof b === 'boolean') {
            return (a === b) ? 0 : a ? 1 : -1;
        }

        if (typeof a === 'number' && typeof b === 'number') {
            return a - b
        }

        const aStr = String(a).toLowerCase();
        const bStr = String(b).toLowerCase();

        return aStr.localeCompare(bStr);
    };

    const sorted = [...data].sort((itemA, itemB) => {
        const valA = itemA[field];
        const valB = itemB[field];
        const compResult = compare(valA, valB);

        return ascending ? compResult : - compResult;
    });

    return sorted;

}

export default {
    getReadableDate,
    convertDate,
    getFullDate,
    handleLogClick,
    getOrdinalSuffix,
    getTimeOfDay,
    searchFilter,
    filterData,
    sortByField,
    normalizeDate
}