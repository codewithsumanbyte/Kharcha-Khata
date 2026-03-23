"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { db } from "@/lib/db";
import { useStore } from "@/store/useStore";

const CATEGORIES = ["Salary", "Business", "Investment", "Gift", "Other"];

export default function AddIncome() {
    const router = useRouter();
    const { activeUserId, currencySymbol } = useStore();

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [customCategory, setCustomCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");
    const [tags] = useState("");
    const [allocateGoalId, setAllocateGoalId] = useState("");

    const activeGoals = useLiveQuery(
        () => activeUserId ? db.goals.where("userId").equals(activeUserId).filter(g => g.currentAmount < g.targetAmount).toArray() : [],
        [activeUserId]
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !activeUserId || isNaN(Number(amount))) return;

        const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

        await db.expenses.add({
            id: crypto.randomUUID(),
            userId: activeUserId,
            type: 'income',
            amount: Number(amount),
            currency: "USD",
            category: finalCategory,
            date: new Date(date).getTime(),
            notes,
            tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        });

        if (allocateGoalId) {
            const goal = await db.goals.get(allocateGoalId);
            if (goal) {
                await db.goals.update(allocateGoalId, {
                    currentAmount: goal.currentAmount + Number(amount)
                });
            }
        }

        router.push("/dashboard");
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-md mx-auto"
        >
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 glass-button rounded-full">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <h1 className="text-2xl font-bold">Add Income</h1>
            </header>

            <form onSubmit={handleSave} className="space-y-6 glass p-6 mb-20">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-success/80 text-xl font-medium">{currencySymbol}</span>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="glass-input pl-12 text-xl font-bold py-4 text-success border-success/30 focus:border-success"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Income Source</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="glass-input appearance-none text-foreground/90"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-background text-foreground">{c}</option>)}
                    </select>
                </div>

                {category === "Other" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                        <label className="text-sm font-medium text-foreground/50 px-1">Custom Source Name</label>
                        <input
                            type="text"
                            required
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="glass-input"
                            placeholder="e.g. Freelance, Sold Item"
                        />
                    </motion.div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass-input [color-scheme:dark]"
                    />
                </div>

                {activeGoals && activeGoals.length > 0 && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground/50 px-1">Allocate to Goal (Optional)</label>
                        <select
                            value={allocateGoalId}
                            onChange={(e) => setAllocateGoalId(e.target.value)}
                            className="glass-input appearance-none text-foreground/90"
                        >
                            <option value="" className="bg-background text-foreground">Do not allocate</option>
                            {activeGoals.map(g => <option key={g.id} value={g.id} className="bg-background text-foreground">{g.title}</option>)}
                        </select>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Notes (Optional)</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="glass-input"
                        placeholder="Project advance"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!amount}
                    className="w-full bg-success text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity hover:opacity-90 active:scale-[0.98] mt-4 shadow-lg shadow-success/20"
                >
                    <Save className="w-5 h-5" />
                    Save Income
                </button>
            </form>
        </motion.main>
    );
}
