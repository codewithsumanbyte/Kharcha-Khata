import Dexie, { type Table } from 'dexie';

export interface User {
    id: string; // UUID
    name: string;
    createdAt: number;
}

export interface Expense {
    id: string; // UUID
    userId: string;
    type?: 'expense' | 'income';
    amount: number;
    currency: string;
    category: string;
    date: number; // timestamp
    notes: string;
    tags: string[];
    receiptUrl?: string; // Base64 encoded image string
}

export interface Budget {
    id: string; // UUID
    userId: string;
    category: string;
    limit: number;
    period: string; // 'monthly'
}

export interface Goal {
    id: string; // UUID
    userId: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    createdAt: number;
}

export interface Category {
    id: string; // UUID
    userId: string;
    name: string;
    icon: string; // Emoji or Lucide icon name
    color: string; // Hex color code
    type: 'expense' | 'income';
    isDefault?: boolean;
}

export class KharchaKhataDB extends Dexie {
    users!: Table<User>;
    expenses!: Table<Expense>;
    budgets!: Table<Budget>;
    goals!: Table<Goal>;
    categories!: Table<Category>;

    constructor() {
        super('KharchaKhataDB');
        this.version(1).stores({
            users: 'id',
            expenses: 'id, userId, category, date',
            budgets: 'id, userId, category'
        });

        this.version(2).stores({
            goals: 'id, userId'
        });

        this.version(3).stores({
            categories: 'id, userId, type'
        });
    }
}


export const db = new KharchaKhataDB();
