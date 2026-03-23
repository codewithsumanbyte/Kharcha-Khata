"use client";

import { useState, useEffect } from "react";
import { useActiveUser } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { motion } from "framer-motion";
import { Download, Upload, User as UserIcon, FileText, Smartphone, LayoutGrid, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

export default function Settings() {
    const user = useActiveUser();
    const { setActiveUser, currencySymbol, setCurrencySymbol, theme, setTheme, language, setLanguage } = useStore();
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [exportPeriod, setExportPeriod] = useState<number>(0); // 0 = All Time, 1 = 1 Month, etc.

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    const handleExport = async () => {
        if (!user) return;
        try {
            const allTransactions = await db.expenses.where("userId").equals(user.id).toArray();
            let expenses = allTransactions;
            if (exportPeriod > 0) {
                const cutoffDate = new Date();
                cutoffDate.setMonth(cutoffDate.getMonth() - exportPeriod);
                const cutoffTime = cutoffDate.getTime();
                expenses = allTransactions.filter(t => t.date >= cutoffTime);
            }

            const exportData = {
                user,
                expenses,
                exportDate: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `kharcha_export_${user.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Failed to export.");
        }
    };

    const handleExportPDF = async () => {
        if (!user) return;
        try {
            const allTransactions = await db.expenses.where("userId").equals(user.id).toArray();
            let filteredTransactions = allTransactions;
            if (exportPeriod > 0) {
                const cutoffDate = new Date();
                cutoffDate.setMonth(cutoffDate.getMonth() - exportPeriod);
                const cutoffTime = cutoffDate.getTime();
                filteredTransactions = allTransactions.filter(t => t.date >= cutoffTime);
            }

            const expensesOnly = filteredTransactions.filter(exp => exp.type !== 'income');
            const doc = new jsPDF();

            try {
                const img = new Image();
                img.src = '/logo.svg';
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const canvas = document.createElement("canvas");
                canvas.width = 120;
                canvas.height = 120;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, 120, 120);
                    const pngDataUrl = canvas.toDataURL("image/png");
                    doc.addImage(pngDataUrl, "PNG", 14, 10, 14, 14);
                }

                doc.setFontSize(16);
                doc.text("Kharcha Khata", 32, 16);
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text("Expense Report", 32, 21);
                doc.setTextColor(0);
                doc.setFontSize(12);
            } catch {
                // Ignore logo failure and fall back to pure text
                doc.setFontSize(18);
                doc.text("Kharcha Khata - Expense Report", 14, 15);
                doc.setFontSize(12);
            }

            doc.text(`User: ${user.name}`, 14, 32);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

            const tableData = expensesOnly
                .sort((a, b) => b.date - a.date)
                .map(exp => [
                    new Date(exp.date).toLocaleDateString(),
                    exp.category,
                    exp.notes || "-",
                    exp.amount.toFixed(2)
                ]);

            autoTable(doc, {
                startY: 45,
                head: [[`Date`, `Category`, `Notes`, `Amount`]],
                body: tableData,
            });

            doc.save(`kharcha_report_${user.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to export PDF.");
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.expenses && Array.isArray(data.expenses)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const importedExpenses = data.expenses.map((exp: any) => ({
                        ...exp,
                        userId: user.id,
                        id: crypto.randomUUID()
                    }));
                    await db.expenses.bulkAdd(importedExpenses);
                    alert(`Successfully imported ${importedExpenses.length} expenses.`);
                }
            } catch {
                alert("Invalid file format.");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleSwitchUser = () => {
        setActiveUser(null);
        router.push("/");
    };

    return (
        <motion.main
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 max-w-md mx-auto space-y-6 mb-20"
        >
            <header className="mb-8">
                <h1 className="text-2xl font-bold">Settings</h1>
            </header>

            <section className="glass p-6 space-y-6">
                <div>
                    <h2 className="text-sm font-medium text-foreground/50 mb-4 px-1 uppercase tracking-wider">Account</h2>
                    <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-foreground/70" />
                            </div>
                            <div>
                                <p className="font-semibold">{user?.name}</p>
                                <p className="text-xs text-foreground/50">Active Profile</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSwitchUser}
                            className="text-sm border border-foreground/20 px-3 py-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                        >
                            Switch
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-medium text-foreground/50 mb-4 px-1 uppercase tracking-wider">Preferences</h2>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/settings/categories')}
                            className="w-full flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10 hover:bg-foreground/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="w-5 h-5 text-foreground/70" />
                                <div className="font-medium text-foreground/90">Custom Categories</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-foreground/40" />
                        </button>
                        <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                            <div className="font-medium text-foreground/90">Theme</div>
                            <div className="flex items-center gap-2 bg-background border border-foreground/20 rounded-lg p-1">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === 'light' ? 'bg-foreground text-background' : 'text-foreground/50'}`}
                                >Light</button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-foreground text-background' : 'text-foreground/50'}`}
                                >Dark</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                            <div className="font-medium text-foreground/90">Language</div>
                            <select
                                value={language}
                                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                onChange={(e) => setLanguage(e.target.value as any)}
                                className="bg-background text-foreground border border-foreground/20 rounded-lg px-3 py-1 outline-none text-sm"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी (Hindi)</option>
                                <option value="bn">বাংলা (Bengali)</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                            <div className="font-medium text-foreground/90">Currency Symbol</div>
                            <select
                                value={currencySymbol}
                                onChange={(e) => setCurrencySymbol(e.target.value)}
                                className="bg-background text-foreground border border-foreground/20 rounded-lg px-3 py-1 outline-none text-sm"
                            >
                                <option value="$">$ (USD)</option>
                                <option value="€">€ (EUR)</option>
                                <option value="£">£ (GBP)</option>
                                <option value="₹">₹ (INR)</option>
                                <option value="¥">¥ (JPY)</option>
                                <option value="A$">A$ (AUD)</option>
                                <option value="C$">C$ (CAD)</option>
                                <option value="₣">₣ (CHF)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-medium text-foreground/50 mb-4 px-1 uppercase tracking-wider">Data Sync</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10 mb-2">
                            <div className="font-medium text-foreground/90">Export Duration</div>
                            <select
                                value={exportPeriod}
                                onChange={(e) => setExportPeriod(Number(e.target.value))}
                                className="bg-background text-foreground border border-foreground/20 rounded-lg px-3 py-1 outline-none text-sm"
                            >
                                <option value={0}>All Time</option>
                                <option value={1}>Last 1 Month</option>
                                <option value={2}>Last 2 Months</option>
                                <option value={3}>Last 3 Months</option>
                                <option value={6}>Last 6 Months</option>
                            </select>
                        </div>

                        {deferredPrompt && (
                            <button
                                onClick={handleInstall}
                                className="w-full glass p-4 flex items-center gap-3 hover:bg-foreground/10 transition-colors border border-target/5 bg-success/10 text-success"
                            >
                                <Smartphone className="w-5 h-5" />
                                <div className="text-left font-medium">Install App (PWA)</div>
                            </button>
                        )}
                        <button
                            onClick={handleExportPDF}
                            className="w-full glass p-4 flex items-center gap-3 hover:bg-foreground/10 transition-colors border border-foreground/5"
                        >
                            <FileText className="w-5 h-5 text-foreground/70" />
                            <div className="text-left font-medium">Export Report (PDF)</div>
                        </button>
                        <button
                            onClick={handleExport}
                            className="w-full glass p-4 flex items-center gap-3 hover:bg-foreground/10 transition-colors border border-foreground/5"
                        >
                            <Download className="w-5 h-5 text-foreground/70" />
                            <div className="text-left font-medium">Export Data (JSON)</div>
                        </button>

                        <label className="w-full glass p-4 flex items-center gap-3 hover:bg-foreground/10 transition-colors cursor-pointer border border-foreground/5">
                            <Upload className="w-5 h-5 text-foreground/70" />
                            <div className="text-left font-medium">Import Data (JSON)</div>
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>
            </section>

            <p className="text-center text-xs text-foreground/30 mt-8 mb-4">
                Developed by Suman Bnaerjee
            </p>
        </motion.main>
    );
}
