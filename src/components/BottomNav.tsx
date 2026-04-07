"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, PieChart, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Expenses", href: "/dashboard", icon: Home },
        { name: "Income", href: "/income", icon: Wallet },
        { name: "Analytics", href: "/analytics", icon: PieChart },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-2 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <nav className="glass flex items-center justify-around p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative p-3 rounded-xl flex items-center justify-center transition-colors hover:bg-foreground/5 active:scale-90"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-foreground/15 rounded-xl border border-foreground/5"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <motion.div
                                    whileTap={{ scale: 0.8 }}
                                    initial={false}
                                    className="relative z-10"
                                >
                                    <Icon
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`w-6 h-6 transition-colors ${isActive ? "text-foreground" : "text-foreground/40"
                                            }`}
                                    />
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
