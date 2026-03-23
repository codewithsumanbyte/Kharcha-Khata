"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { translations } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Plus, Target, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function IncomeDashboard() {
    const user = useActiveUser();
    const { currencySymbol, language } = useStore();
    const t = translations[language];

    const allLogs = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).reverse().sortBy("date") : [],
        [user?.id]
    );

    const incomeTransactions = allLogs?.filter(e => e.type === 'income') || [];
    const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

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
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-foreground/70 mb-1">{t.totalIncome}</h3>
                        <p className="text-4xl font-bold tracking-tight text-success">
                            {currencySymbol}{totalIncome.toFixed(2)}
                        </p>
                    </div>
                    <Link
                        href="/add-income"
                        className="w-12 h-12 bg-success/20 text-success hover:bg-success/30 rounded-2xl flex items-center justify-center transition-all active:scale-95 z-10 relative"
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
                    {incomeTransactions.slice(0, 10).map(inc => (
                        <div key={inc.id} className="glass p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-base">{inc.category}</p>
                                <p className="text-xs text-foreground/50">{inc.notes || new Date(inc.date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-semibold text-lg text-success">
                                +{currencySymbol}{inc.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                    {!incomeTransactions.length && (
                        <div className="text-center p-6 border border-dashed border-foreground/20 rounded-2xl">
                            <p className="text-foreground/50">{t.noExpenses}</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-8">
                <Link href="/goals" className="glass p-5 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/70">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg hover:text-foreground/90 transition-colors">Savings Goals</h4>
                            <p className="text-xs text-foreground/50">Track your dreams and allocate funds</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-foreground/70 transition-colors" />
                </Link>
            </section>


        </motion.main>
    );
}
