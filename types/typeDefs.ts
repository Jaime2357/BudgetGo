import { imageMap } from "@/assets/images/imageMap";

// Table Object Props
export type SavingAccount = {
    id: number;
    name: string;
    balance: number;
    threshold: number;
    modifications: number;
    image_uri: string | null;
};

export type CreditAccount = {
    id: number;
    name: string;
    current_balance: number;
    pending_charges: number;
    image_uri: string | null;
};

export type RecExpenses = {
    id: number;
    name: string;
    type: string;
    amount: number;
    credited_to: number;
    paid_for_month: boolean;
    reccurring_date: number;
}

export type PlanExpenses = {
    id: number;
    name: string;
    type: string;
    amount: number;
    credited_to: number;
    withdrawn_from: number;
    paid: boolean;
    paid_date: Date;
}

export type Transaction = {
    id: number;
    name: string;
    type: string;
    amount: number;
    credited_to?: number | null;
    withdrawn_from?: number | null;
    deposited_to?: number | null;
    transaction_date: Date;
}

export type RecIncome = {
    id: number;
    name: string;
    type: string;
    amount: number;
    deposited_to: number;
    received: boolean;
    expected_date: number;
}

export type Income = {
    id: number;
    name: string;
    type: string;
    amount: number;
    deposited_to: number;
    received: boolean;
    paid_date: Date;
}

// Component Props
export interface SavingsCardProps {
    type: 'savings';
    id: number;
    name: string;
    balance: number;
    threshold: number;
    imageKey: string | null;
}

export interface CreditCardProps {
    type: 'credit';
    id: number;
    name: string;
    current_balance: number;
    pending_charges: number;
    imageKey: string | null;
}

export type PickerItem = {
    label: string;
    value: number;
};

export type CardComponentProps =
  | (SavingAccount & { type: 'savings'; imageKey: keyof typeof imageMap | string | null})
  | (CreditAccount & { type: 'credit'; imageKey: keyof typeof imageMap | string | null})
  | { type: 'add'; id: 'add' };