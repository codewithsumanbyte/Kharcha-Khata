"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { db } from "@/lib/db";
import { useStore } from "@/store/useStore";

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Other"];

export default function AddExpensePage() {
    const router = useRouter();
    const { activeUserId, currencySymbol } = useStore();
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [customCategory, setCustomCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState("");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !activeUserId || isNaN(Number(amount))) return;

        const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

        await db.expenses.add({
            id: crypto.randomUUID(),
            userId: activeUserId,
            type: 'expense',
            amount: Number(amount),
            currency: "USD",
            category: finalCategory,
            date: new Date(date).getTime(),
            notes,
            tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        });

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
                <h1 className="text-2xl font-bold">Add Expense</h1>
            </header>

            <form onSubmit={handleSave} className="space-y-6 glass p-6 mb-20">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 text-xl font-medium">{currencySymbol}</span>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="glass-input pl-12 text-xl font-bold py-4"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Category</label>
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
                        <label className="text-sm font-medium text-foreground/50 px-1">Custom Category Name</label>
                        <input
                            type="text"
                            required
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="glass-input"
                            placeholder="e.g. Freelance, Gift"
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

                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Notes (Optional)</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="glass-input"
                        placeholder="Lunch at cafe"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/50 px-1">Tags (Comma separated)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="glass-input"
                        placeholder="work, trip"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!amount}
                    className="w-full bg-foreground text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity hover:opacity-90 active:scale-[0.98] mt-4"
                >
                    <Save className="w-5 h-5" />
                    Save Expense
                </button>
            </form>
        </motion.main>
    );
}
