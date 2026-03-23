"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, ChevronLeft, ChevronRight, Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManageExpenses() {
    const user = useActiveUser();
    const router = useRouter();
    const { currencySymbol, language } = useStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

    const allExpenses = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).reverse().sortBy("date") : [],
        [user?.id]
    );

    const expenses = allExpenses?.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
    });

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const formatMonthName = (date: Date) => {
        return date.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US', { month: 'long', year: 'numeric' });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            await db.expenses.delete(id);
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-md mx-auto mb-20"
        >
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 glass-button rounded-full">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Manage Expenses</h1>
                    <p className="text-foreground opacity-50 text-sm">Review or delete past logs.</p>
                </div>
            </header>

            <div className="flex items-center justify-between mb-6 glass px-4 py-2 rounded-2xl">
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

            <motion.section layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {expenses?.map((exp, idx) => (
                        <motion.div
                            key={exp.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass p-4 flex items-center justify-between"
                        >
                            <div>
                                <p className="font-medium text-base">{exp.category}</p>
                                <p className="text-xs text-foreground opacity-50">{exp.notes || new Date(exp.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {exp.receiptUrl && (
                                    <button
                                        onClick={() => setViewReceiptUrl(exp.receiptUrl!)}
                                        className="p-2 rounded-lg bg-foreground/5 text-foreground/70 hover:bg-foreground/10 transition-colors"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                )}
                                <p className={`font-semibold text-lg ${exp.type === 'income' ? 'text-success' : ''}`}>
                                    {exp.type === 'income' ? '+' : '-'}{currencySymbol}{exp.amount.toFixed(2)}
                                </p>
                                <button
                                    onClick={() => handleDelete(exp.id)}
                                    className="p-2 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {!expenses?.length && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-foreground opacity-50 p-6 border border-dashed border-[var(--border)] rounded-2xl"
                    >
                        No expenses found for this month.
                    </motion.p>
                )}
            </motion.section>

            <AnimatePresence>
                {viewReceiptUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4"
                        onClick={() => setViewReceiptUrl(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                            onClick={() => setViewReceiptUrl(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            src={viewReceiptUrl}
                            alt="Receipt Viewer"
                            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.main>
    );
}
