"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center gap-6"
            >
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 border-4 border-foreground/10 rounded-full"
                    />
                    <motion.div
                        className="absolute inset-0 border-4 border-t-foreground rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.svg" alt="Kharcha Khata" className="w-12 h-12 relative z-10" />
                </div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-foreground/70 font-medium tracking-wide"
                >
                    Loading...
                </motion.p>
            </motion.div>
        </div>
    );
}
