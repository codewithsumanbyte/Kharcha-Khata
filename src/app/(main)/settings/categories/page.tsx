"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Category } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

const DEFAULT_COLORS = ["#3f83f8", "#0e9f6e", "#ff5a1f", "#e02424", "#8b5cf6", "#eab308", "#ec4899", "#14b8a6"];
const DEFAULT_ICONS = ["🍔", "🚌", "🏠", "🎮", "🐾", "🛒", "⛽", "🏥", "📚", "✈️", "💸", "💼"];

export default function ManageCategories() {
    const user = useActiveUser();
    const router = useRouter();

    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState(DEFAULT_ICONS[0]);
    const [color, setColor] = useState(DEFAULT_COLORS[0]);
    const [type, setType] = useState<'expense' | 'income'>('expense');

    const categories = useLiveQuery(
        () => user ? db.categories.where("userId").equals(user.id).toArray() : [],
        [user?.id]
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;

        await db.categories.add({
            id: crypto.randomUUID(),
            userId: user.id,
            name: name.trim(),
            icon,
            color,
            type
        });

        setName("");
        setIsCreating(false);
    };

    const handleDelete = async (id: string, isDefault?: boolean) => {
        if (isDefault) {
            alert("Default categories cannot be deleted directly.");
            return;
        }
        if (confirm("Are you sure you want to delete this category? Past expenses using this category won't be deleted, but they might not show custom icons.")) {
            await db.categories.delete(id);
        }
    };

    const expenseCategories = categories?.filter(c => c.type === 'expense') || [];
    const incomeCategories = categories?.filter(c => c.type === 'income') || [];

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-md mx-auto mb-20"
        >
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 glass-button rounded-full">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Categories</h1>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 rounded-xl bg-foreground text-background"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            <AnimatePresence mode="popLayout">
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass p-6 rounded-3xl mb-8 overflow-hidden"
                    >
                        <h2 className="text-lg font-semibold mb-4">New Category</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="flex gap-2 p-1 bg-background rounded-xl border border-foreground/10 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'expense' ? 'bg-danger text-white' : 'text-foreground/50'}`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'income' ? 'bg-success text-white' : 'text-foreground/50'}`}
                                >
                                    Income
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Category Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="glass-input w-full"
                                required
                            />

                            <div>
                                <label className="text-xs text-foreground/50 mb-2 block">Icon</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {DEFAULT_ICONS.map(i => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setIcon(i)}
                                            className={`h-10 text-xl flex items-center justify-center rounded-xl transition-all ${icon === i ? 'bg-foreground/10 border-foreground/30 border glass' : 'hover:bg-foreground/5'}`}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-foreground/50 mb-2 block">Color</label>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {DEFAULT_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform ${color === c ? 'scale-110 ring-2 ring-foreground/20 ring-offset-2 ring-offset-background' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-3 text-sm font-medium text-foreground/70 bg-foreground/5 rounded-xl border border-foreground/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim()}
                                    className="flex-1 py-3 text-sm font-medium text-background bg-foreground rounded-xl disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="space-y-6">
                <div>
                    <h2 className="text-sm font-medium text-foreground/50 mb-3 px-1 uppercase tracking-wider text-danger">Expenses</h2>
                    <div className="space-y-2">
                        {expenseCategories.map(cat => (
                            <CategoryRow key={cat.id} category={cat} onDelete={() => handleDelete(cat.id, cat.isDefault)} />
                        ))}
                        {expenseCategories.length === 0 && <p className="text-sm text-foreground/30 px-1 py-2">No custom expense categories.</p>}
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-medium text-foreground/50 mb-3 px-1 uppercase tracking-wider text-success">Income</h2>
                    <div className="space-y-2">
                        {incomeCategories.map(cat => (
                            <CategoryRow key={cat.id} category={cat} onDelete={() => handleDelete(cat.id, cat.isDefault)} />
                        ))}
                        {incomeCategories.length === 0 && <p className="text-sm text-foreground/30 px-1 py-2">No custom income categories.</p>}
                    </div>
                </div>
            </section>
        </motion.main>
    );
}

function CategoryRow({ category, onDelete }: { category: Category, onDelete: () => void }) {
    return (
        <div className="glass p-4 rounded-2xl flex items-center justify-between border-l-4" style={{ borderColor: category.color }}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${category.color}20` }}>
                    {category.icon}
                </div>
                <div>
                    <p className="font-semibold text-foreground/90">{category.name}</p>
                    {category.isDefault && <p className="text-[10px] text-foreground/40 uppercase tracking-wide">Default</p>}
                </div>
            </div>
            {!category.isDefault && (
                <button
                    onClick={onDelete}
                    className="p-2 text-danger opacity-50 hover:opacity-100 transition-opacity bg-danger/5 hover:bg-danger/10 rounded-lg"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
