export const translations = {
    en: {
        dashboard: "Dashboard",
        addLog: "Add Log",
        analytics: "Analytics",
        budget: "Budget",
        settings: "Settings",
        totalBalance: "Total Balance",
        totalSpent: "Total Spent",
        totalIncome: "Total Income",
        recentTransactions: "Recent Transactions",
        manageAll: "Manage All",
        noExpenses: "No logs yet. Add one!",
        welcome: "Welcome back,"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        addLog: "लॉग जोड़ें",
        analytics: "विश्लेषण",
        budget: "बजट",
        settings: "सेटिंग्स",
        totalBalance: "कुल शेष",
        totalSpent: "कुल खर्च",
        totalIncome: "कुल आय",
        recentTransactions: "हाल के लेनदेन",
        manageAll: "सभी प्रबंधित करें",
        noExpenses: "अभी तक कोई लॉग नहीं है। एक जोड़ें!",
        welcome: "वापसी पर स्वागत है,"
    },
    bn: {
        dashboard: "ড্যাশবোর্ড",
        addLog: "লগ যোগ করুন",
        analytics: "বিশ্লেষণ",
        budget: "বাজেট",
        settings: "সেটিংস",
        totalBalance: "মোট ব্যালেন্স",
        totalSpent: "মোট খরচ",
        totalIncome: "মোট আয়",
        recentTransactions: "সাম্প্রতিক লেনদেন",
        manageAll: "সব পরিচালনা করুন",
        noExpenses: "এখনও কোনও লগ নেই। একটি যোগ করুন!",
        welcome: "ফিরে আসায় স্বাগতম,"
    }
} as const;

export type Language = 'en' | 'hi' | 'bn';
