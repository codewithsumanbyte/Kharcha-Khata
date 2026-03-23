"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import BottomNav from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { activeUserId, isHydrated } = useStore();

    useEffect(() => {
        if (isHydrated && !activeUserId) {
            router.push("/");
        }
    }, [activeUserId, isHydrated, router]);

    if (!isHydrated || !activeUserId) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-foreground/50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background relative pb-24">
            {/* Global Background Glow */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-foreground/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />

            {children}
            <BottomNav />
        </div>
    );
}
