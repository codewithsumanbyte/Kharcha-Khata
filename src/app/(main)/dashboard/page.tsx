"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { translations } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const user = useActiveUser();
    const { currencySymbol, language } = useStore();
    const t = translations[language];

    const [currentDate, setCurrentDate] = useState(new Date());

    const expenses = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).reverse().sortBy("date") : [],
        [user?.id]
    );

    const expenseTransactions = expenses?.filter(e => {
        if (e.type === 'income') return false;
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
    }) || [];
    
    const totalSpent = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const formatMonthName = (date: Date) => {
        return date.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-md mx-auto relative pb-24"
        >
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-medium text-foreground/50">{t.welcome}</h1>
                    <h2 className="text-2xl font-bold text-gradient">{user?.name || "User"}</h2>
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

            <section className="glass p-6 rounded-3xl mb-8 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-foreground/70 mb-1">{t.totalSpent}</h3>
                        <motion.p
                            key={totalSpent}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold tracking-tight text-danger"
                        >
                            {currencySymbol}{totalSpent.toFixed(2)}
                        </motion.p>
                    </div>
                    <Link
                        href="/add-expense"
                        className="w-12 h-12 bg-danger/20 text-danger hover:bg-danger/30 rounded-2xl flex items-center justify-center transition-all active:scale-95 z-10 relative"
                    >
                        <Plus className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-lg font-semibold">{t.recentTransactions}</h3>
                    <Link href="/manage" className="text-xs text-foreground/50 hover:text-foreground transition-colors">{t.manageAll}</Link>
                </div>
                <motion.div layout className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {expenseTransactions.slice(0, 10).map((exp, idx) => (
                            <motion.div
                                key={exp.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-base">{exp.category}</p>
                                    <p className="text-xs text-foreground/50">{exp.notes || new Date(exp.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-lg text-foreground/90">
                                    -{currencySymbol}{exp.amount.toFixed(2)}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {!expenseTransactions.length && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center p-6 border border-dashed border-foreground/20 rounded-2xl"
                        >
                            <p className="text-foreground/50">{t.noExpenses}</p>
                        </motion.div>
                    )}
                </motion.div>
            </section>


        </motion.main>
    );
}
