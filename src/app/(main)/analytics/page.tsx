"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, ReferenceLine } from 'recharts';
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const COLORS = ['#3f83f8', '#0e9f6e', '#ff5a1f', '#e02424', '#8b5cf6', '#eab308', '#ec4899', '#14b8a6'];

export default function Analytics() {
    const user = useActiveUser();
    const { currencySymbol, language } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const allExpenses = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).toArray() : [],
        [user?.id]
    );

    if (!allExpenses) return null;

    const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const formatMonthName = (date: Date) => {
        return date.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US', { month: 'long', year: 'numeric' });
    };

    const currentMonthExpenses = allExpenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
    });

    // Aggregate by category for Pie Chart
    const expenseOnly = currentMonthExpenses.filter(e => e.type !== 'income');
    const categoryData = expenseOnly.reduce((acc, curr) => {
        const existing = acc.find(c => c.name === curr.category);
        if (existing) {
            existing.value += curr.amount;
        } else {
            acc.push({ name: curr.category, value: curr.amount });
        }
        return acc;
    }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value);

    // Income vs Expense
    const totalIncome = currentMonthExpenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenseOnly.reduce((acc, curr) => acc + curr.amount, 0);
    const inExData = [
        { name: 'Overview', Income: totalIncome, Expense: totalExpense }
    ];

    // Daily Trend
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, amount: 0 }));
    
    expenseOnly.forEach(e => {
        const day = new Date(e.date).getDate();
        dailyData[day - 1].amount += e.amount;
    });

    const averageDaily = totalExpense / daysInMonth;
    const peakDay = dailyData.reduce((max, curr) => curr.amount > max.amount ? curr : max, dailyData[0]);

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-md mx-auto mb-20 space-y-6"
        >
            <header>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-foreground/50 text-sm">Deep insights into your spending.</p>
            </header>

            <div className="flex items-center justify-between glass px-4 py-2 rounded-2xl">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-foreground/70" />
                </button>
                <div className="text-center font-medium min-w-[120px]">
                    {formatMonthName(currentDate)}
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5 text-foreground/70" />
                </button>
            </div>

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

            <section className="glass p-6">
                <h2 className="text-lg font-semibold mb-6">Income vs Expense</h2>
                <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inExData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--foreground)" opacity={0.5} />
                            <YAxis stroke="var(--foreground)" opacity={0.5} tickFormatter={(value) => `${currencySymbol}${value}`} />
                            <Tooltip
                                cursor={{ fill: 'var(--foreground)', opacity: 0.1 }}
                                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, undefined]}
                            />
                            <Legend />
                            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="glass p-6">
                <h2 className="text-lg font-semibold mb-6">Daily Spending Trend</h2>
                
                {peakDay && peakDay.amount > averageDaily * 2 && peakDay.amount > 0 && (
                    <div className="mb-4 bg-danger/10 text-danger p-3 rounded-xl flex items-start gap-3 text-sm">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>High spending alert on the {peakDay.day}th. You spent {currencySymbol}{peakDay.amount.toFixed(2)} in a single day!</p>
                    </div>
                )}

                <div className="h-48 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="day" stroke="var(--foreground)" opacity={0.5} />
                            <YAxis stroke="var(--foreground)" opacity={0.5} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                labelFormatter={(label) => `Day ${label}`}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Spent']}
                            />
                            <ReferenceLine y={averageDaily} stroke="var(--danger)" strokeDasharray="3 3" opacity={0.5} />
                            <Line type="monotone" dataKey="amount" stroke="var(--foreground)" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: 'var(--foreground)' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </motion.main>
    );
}
