"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManageExpenses() {
    const user = useActiveUser();
    const router = useRouter();
    const { currencySymbol } = useStore();

    const expenses = useLiveQuery(
        () => user ? db.expenses.where("userId").equals(user.id).reverse().sortBy("date") : [],
        [user?.id]
    );

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
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 glass-button rounded-full">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Manage Expenses</h1>
                    <p className="text-foreground opacity-50 text-sm">Review or delete past logs.</p>
                </div>
            </header>

            <section className="space-y-3">
                {expenses?.map(exp => (
                    <div key={exp.id} className="glass p-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-base">{exp.category}</p>
                            <p className="text-xs text-foreground opacity-50">{exp.notes || new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="font-semibold text-lg">-{currencySymbol}{exp.amount.toFixed(2)}</p>
                            <button
                                onClick={() => handleDelete(exp.id)}
                                className="p-2 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {!expenses?.length && (
                    <p className="text-center text-foreground opacity-50 p-6 border border-dashed border-[var(--border)] rounded-2xl">
                        No expenses found.
                    </p>
                )}
            </section>
        </motion.main>
    );
}
