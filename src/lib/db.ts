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

export class KharchaKhataDB extends Dexie {
    users!: Table<User>;
    expenses!: Table<Expense>;
    budgets!: Table<Budget>;
    goals!: Table<Goal>;

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
    }
}


export const db = new KharchaKhataDB();
