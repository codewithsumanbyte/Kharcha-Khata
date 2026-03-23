"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3f83f8', '#0e9f6e', '#ff5a1f', '#e02424', '#8b5cf6', '#eab308', '#ec4899', '#14b8a6'];

export default function Analytics() {
    const user = useActiveUser();
    const expenses = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).toArray() : [],
        [user?.id]
    );

    if (!expenses) return null;

    // Aggregate by category for Pie Chart
    const expenseOnly = expenses.filter(e => e.type !== 'income');
    const categoryData = expenseOnly.reduce((acc, curr) => {
        const existing = acc.find(c => c.name === curr.category);
        if (existing) {
            existing.value += curr.amount;
        } else {
            acc.push({ name: curr.category, value: curr.amount });
        }
        return acc;
    }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value);

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-md mx-auto mb-10"
        >
            <header className="mb-8">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-foreground/50 text-sm">Deep insights into your spending.</p>
            </header>

            <section className="glass p-6 mb-6">
                <h2 className="text-lg font-semibold mb-6">Spending by Category</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-sm font-medium">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Placeholder for weekly trends */}
            <section className="glass p-6 opacity-70">
                <h2 className="text-lg font-semibold mb-2">Weekly Trends</h2>
                <p className="text-sm text-foreground/50">Log more expenses across different days to unlock trends.</p>
            </section>
        </motion.main>
    );
}
