"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, X, CheckCircle2, TrendingUp, Trash2 } from "lucide-react";

export default function GoalsDashboard() {
    const user = useActiveUser();
    const { currencySymbol } = useStore();

    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");

    const [allocateGoalId, setAllocateGoalId] = useState<string | null>(null);
    const [allocateAmount, setAllocateAmount] = useState("");

    const goals = useLiveQuery(
        () => user ? db.goals.where("userId").equals(user.id).reverse().sortBy("createdAt") : [],
        [user?.id]
    );

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !targetAmount || !user) return;

        await db.goals.add({
            id: crypto.randomUUID(),
            userId: user.id,
            title: title.trim(),
            targetAmount: Number(targetAmount),
            currentAmount: 0,
            createdAt: Date.now(),
        });

        setIsCreating(false);
        setTitle("");
        setTargetAmount("");
    };

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allocateGoalId || !allocateAmount || isNaN(Number(allocateAmount))) return;

        const goal = await db.goals.get(allocateGoalId);
        if (goal) {
            await db.goals.update(allocateGoalId, {
                currentAmount: goal.currentAmount + Number(allocateAmount)
            });
        }

        setAllocateGoalId(null);
        setAllocateAmount("");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this goal?")) {
            await db.goals.delete(id);
        }
    };

    const totalSaved = goals?.reduce((acc, curr) => acc + curr.currentAmount, 0) || 0;
    const totalTarget = goals?.reduce((acc, curr) => acc + curr.targetAmount, 0) || 0;

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-md mx-auto relative min-h-screen pb-24"
        >
            <header className="mb-8">
                <h1 className="text-sm font-medium text-foreground/50">Savings Goals</h1>
                <h2 className="text-2xl font-bold text-gradient">Dream Big</h2>
            </header>

            <section className="glass p-6 rounded-3xl mb-8 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-foreground/70 mb-1">Total Saved</h3>
                        <p className="text-4xl font-bold tracking-tight">
                            {currencySymbol}{totalSaved.toFixed(2)}
                        </p>
                    </div>
                </div>
                {totalTarget > 0 && (
                    <div className="mt-4 pt-4 border-t border-foreground/10">
                        <div className="flex justify-between text-xs text-foreground/50 mb-2">
                            <span>Overall Progress</span>
                            <span>{Math.round((totalSaved / totalTarget) * 100)}%</span>
                        </div>
                        <div className="w-full bg-foreground/10 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                className="h-full bg-foreground"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}
            </section>

            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-lg font-semibold">Active Goals</h3>
                    <button onClick={() => setIsCreating(true)} className="text-xs text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" /> New Goal
                    </button>
                </div>

                <div className="space-y-4">
                    {goals?.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const isReached = progress >= 100;

                        return (
                            <div key={goal.id} className="glass p-5 rounded-2xl relative overflow-hidden group">
                                {isReached && (
                                    <div className="absolute inset-0 bg-success/5 pointer-events-none" />
                                )}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isReached ? 'bg-success/20 text-success' : 'bg-foreground/5 text-foreground/70'}`}>
                                            {isReached ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{goal.title}</h4>
                                            <p className="text-xs text-foreground/50">Target: {currencySymbol}{goal.targetAmount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!isReached && (
                                            <button
                                                onClick={() => setAllocateGoalId(goal.id)}
                                                className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors text-foreground/70 shadow-sm active:scale-95"
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-2 bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors text-danger shadow-sm active:scale-95"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 relative z-10">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className={isReached ? 'text-success' : ''}>{currencySymbol}{goal.currentAmount.toFixed(2)}</span>
                                        <span className="text-foreground/40">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className={`h-full ${isReached ? 'bg-success' : 'bg-foreground'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {!goals?.length && (
                        <div className="text-center p-8 border border-dashed border-foreground/20 rounded-3xl">
                            <Target className="w-8 h-8 text-foreground/30 mx-auto mb-3" />
                            <p className="text-foreground/50">No goals yet. Start saving!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Create Goal Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end justify-center sm:items-center p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-surface border border-border w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">New Goal</h3>
                                <button type="button" onClick={() => setIsCreating(false)} className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-foreground/70" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGoal} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground/70 px-1">Goal Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="glass-input"
                                        placeholder="e.g., Vacation Fund, New Laptop"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground/70 px-1">Target Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 font-medium">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            required
                                            value={targetAmount}
                                            onChange={(e) => setTargetAmount(e.target.value)}
                                            className="glass-input pl-10"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!title || !targetAmount}
                                    className="w-full bg-foreground text-background font-semibold py-4 rounded-xl mt-4 disabled:opacity-50 transition-opacity active:scale-[0.98]"
                                >
                                    Create Goal
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Allocate Modal */}
            <AnimatePresence>
                {allocateGoalId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end justify-center sm:items-center p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-surface border border-border w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Allocate Funds</h3>
                                <button type="button" onClick={() => setAllocateGoalId(null)} className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-foreground/70" />
                                </button>
                            </div>

                            <form onSubmit={handleAllocate} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground/70 px-1">Amount to Add</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-success/80 font-medium">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            required
                                            value={allocateAmount}
                                            onChange={(e) => setAllocateAmount(e.target.value)}
                                            className="glass-input pl-10 text-xl py-4 text-success border-success/30 focus:border-success"
                                            placeholder="100"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-foreground/50 px-1 mt-2">Money allocated to goals is purely visual and helps you track your savings progress.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!allocateAmount}
                                    className="w-full bg-success text-white font-semibold py-4 rounded-xl mt-4 disabled:opacity-50 transition-opacity active:scale-[0.98] shadow-lg shadow-success/20"
                                >
                                    Add Funds
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.main>
    );
}
