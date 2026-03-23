import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    activeUserId: string | null;
    setActiveUser: (id: string | null) => void;
    isHydrated: boolean;
    setHydrated: (state: boolean) => void;
    currencySymbol: string;
    setCurrencySymbol: (symbol: string) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    language: 'en' | 'hi' | 'bn';
    setLanguage: (lang: 'en' | 'hi' | 'bn') => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            activeUserId: null,
            setActiveUser: (id) => set({ activeUserId: id }),
            isHydrated: false,
            setHydrated: (state) => set({ isHydrated: state }),
            currencySymbol: "$",
            setCurrencySymbol: (symbol) => set({ currencySymbol: symbol }),
            theme: 'dark',
            setTheme: (t) => set({ theme: t }),
            language: 'en',
            setLanguage: (l) => set({ language: l }),
        }),
        {
            name: 'kharcha-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);
