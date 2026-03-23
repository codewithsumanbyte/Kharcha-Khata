"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Camera, X } from "lucide-react";
import { db } from "@/lib/db";
import { useStore } from "@/store/useStore";

const DEFAULT_EXPENSE_CATEGORIES = [
    { name: "Food", icon: "🍔", color: "#e02424" },
    { name: "Transport", icon: "🚌", color: "#3f83f8" },
    { name: "Shopping", icon: "🛒", color: "#8b5cf6" },
    { name: "Entertainment", icon: "🎮", color: "#ec4899" },
    { name: "Bills", icon: "💸", color: "#eab308" },
    { name: "Health", icon: "🏥", color: "#14b8a6" },
    { name: "Other", icon: "🐾", color: "#9ca3af" },
];

export default function AddExpensePage() {
    const router = useRouter();
    const { activeUserId, currencySymbol } = useStore();
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState("");
    const [receiptUrl, setReceiptUrl] = useState<string>("");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Compress and convert to base64
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                setReceiptUrl(dataUrl);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const categoriesDB = useLiveQuery(
        () => activeUserId ? db.categories.where("userId").equals(activeUserId).filter(c => c.type === 'expense').toArray() : [],
        [activeUserId]
    );

    useEffect(() => {
        const seedCategories = async () => {
            if (activeUserId && categoriesDB !== undefined && categoriesDB.length === 0) {
                const toAdd = DEFAULT_EXPENSE_CATEGORIES.map(c => ({
                    id: crypto.randomUUID(),
                    userId: activeUserId,
                    type: 'expense' as const,
                    name: c.name,
                    icon: c.icon,
                    color: c.color,
                    isDefault: true
                }));
                await db.categories.bulkAdd(toAdd);
            }
        };
        seedCategories();
    }, [activeUserId, categoriesDB]);

    useEffect(() => {
        if (categoriesDB && categoriesDB.length > 0 && !category) {
            setCategory(categoriesDB[0].name);
        }
    }, [categoriesDB, category]);

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
            ...(receiptUrl ? { receiptUrl } : {})
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
                    <div className="flex gap-2">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="glass-input appearance-none text-foreground/90 flex-1"
                        >
                            {categoriesDB?.map(c => <option key={c.id} value={c.name} className="bg-background text-foreground">{c.icon} {c.name}</option>)}
                        </select>
                        <button type="button" onClick={() => router.push('/settings/categories')} className="p-4 glass rounded-xl text-foreground flex-shrink-0">
                            +
                        </button>
                    </div>
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

                <div className="space-y-4 pt-2">
                    {receiptUrl ? (
                        <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={receiptUrl} alt="Receipt Preview" className="h-24 w-24 object-cover rounded-xl border border-foreground/10" />
                            <button
                                type="button"
                                onClick={() => setReceiptUrl("")}
                                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 shadow-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="receipt-upload"
                            />
                            <label
                                htmlFor="receipt-upload"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl cursor-pointer transition-colors text-sm font-medium text-foreground/80"
                            >
                                <Camera className="w-5 h-5" />
                                Attach Receipt
                            </label>
                        </div>
                    )}
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
