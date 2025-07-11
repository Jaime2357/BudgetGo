export interface SavingsCardProps {
    type: 'savings';
    id: number;
    name: string;
    balance: number;
    threshold: number;
    imageKey: string;
}

export interface CreditCardProps {
    type: 'credit';
    id: number;
    name: string;
    current_balance: number;
    true_balance: number;
    pending_charges: number;
    imageKey: string;
}

export type CardComponentProps = SavingsCardProps | CreditCardProps;