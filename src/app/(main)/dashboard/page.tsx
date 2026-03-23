"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { translations } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const user = useActiveUser();
    const { currencySymbol, language } = useStore();
    const t = translations[language];

    const expenses = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).reverse().sortBy("date") : [],
        [user?.id]
    );

    const expenseTransactions = expenses?.filter(e => e.type !== 'income') || [];
    const totalSpent = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-md mx-auto relative pb-24"
        >
            <header className="mb-8">
                <h1 className="text-sm font-medium text-foreground/50">{t.welcome}</h1>
                <h2 className="text-2xl font-bold text-gradient">{user?.name || "User"}</h2>
            </header>

            <section className="glass p-6 rounded-3xl mb-8 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-foreground/70 mb-1">{t.totalSpent}</h3>
                        <p className="text-4xl font-bold tracking-tight text-danger">
                            {currencySymbol}{totalSpent.toFixed(2)}
                        </p>
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
                <div className="space-y-3">
                    {expenseTransactions.slice(0, 10).map(exp => (
                        <div key={exp.id} className="glass p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-base">{exp.category}</p>
                                <p className="text-xs text-foreground/50">{exp.notes || new Date(exp.date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-semibold text-lg text-foreground/90">
                                -{currencySymbol}{exp.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                    {!expenseTransactions.length && (
                        <div className="text-center p-6 border border-dashed border-foreground/20 rounded-2xl">
                            <p className="text-foreground/50">{t.noExpenses}</p>
                        </div>
                    )}
                </div>
            </section>


        </motion.main>
    );
}
