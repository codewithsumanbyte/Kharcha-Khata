"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Other"];

export default function Budget() {
    const user = useActiveUser();
    const { currencySymbol } = useStore();

    const budgets = useLiveQuery(
        () => user ? db.budgets.where("userId").equals(user.id).toArray() : [],
        [user?.id]
    );

    const expenses = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).toArray() : [],
        [user?.id]
    );

    const [category, setCategory] = useState(CATEGORIES[0]);
    const [limit, setLimit] = useState("");

    const handleSetBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !limit) return;

        const existing = await db.budgets.where({ userId: user.id, category }).first();
        if (existing) {
            await db.budgets.update(existing.id, { limit: Number(limit) });
        } else {
            await db.budgets.add({
                id: crypto.randomUUID(),
                userId: user.id,
                category,
                limit: Number(limit),
                period: "monthly"
            });
        }
        setLimit("");
    };

    return (
        <motion.main
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 max-w-md mx-auto mb-20"
        >
            <header className="mb-8">
                <h1 className="text-2xl font-bold">Budgets</h1>
                <p className="text-foreground/50 text-sm">Set limits and track your progress.</p>
            </header>

            <form onSubmit={handleSetBudget} className="glass p-5 mb-8 flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-foreground/50">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="glass-input py-2 px-3 text-sm"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                    </select>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-foreground/50">Limit ({currencySymbol})</label>
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        placeholder="0"
                        className="glass-input py-2 px-3 text-sm"
                    />
                </div>
                <button type="submit" className="bg-foreground text-black font-semibold py-2 px-4 rounded-xl text-sm h-[42px] hover:bg-foreground/90">
                    Save
                </button>
            </form>

            <section className="space-y-4">
                {budgets?.map(budget => {
                    const spent = expenses?.filter(e => e.category === budget.category).reduce((sum, e) => sum + e.amount, 0) || 0;
                    const percentage = Math.min((spent / budget.limit) * 100, 100);
                    const isExceeded = spent > budget.limit;

                    return (
                        <div key={budget.id} className="glass p-5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-lg">{budget.category}</span>
                                <span className={`text-sm font-medium ${isExceeded ? 'text-danger' : 'text-foreground/70'}`}>
                                    {currencySymbol}{spent.toFixed(2)} / {currencySymbol}{budget.limit.toFixed(2)}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    className={`h-full ${isExceeded ? 'bg-danger' : percentage > 80 ? 'bg-orange-400' : 'bg-success'}`}
                                />
                            </div>
                            {isExceeded && (
                                <p className="text-xs text-danger mt-2">Budget exceeded by {currencySymbol}{(spent - budget.limit).toFixed(2)}!</p>
                            )}
                        </div>
                    );
                })}
                {budgets?.length === 0 && (
                    <p className="text-center text-foreground/40 text-sm mt-10">No budgets set yet. Add one above.</p>
                )}
            </section>
        </motion.main>
    );
}
