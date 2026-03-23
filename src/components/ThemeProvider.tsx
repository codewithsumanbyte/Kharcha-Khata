"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useStore();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Initial SSR hack to prevent flash: 
    // We can't do much without next-themes, but client hydration fixes it quickly
    return <>{children}</>;
}
