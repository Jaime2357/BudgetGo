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

function convertDate(date: Date) {
    // Pad function for double digits
    const pad = (d: number) => d.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

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

export default {
    getReadableDate,
    convertDate,
    getFullDate,
    handleLogClick
}