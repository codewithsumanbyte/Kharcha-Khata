# Kharcha Khata 💰

**Kharcha Khata** is a beautiful, privacy-first, offline-ready Progressive Web App (PWA) designed to track your daily expenses, incomes, and savings goals effortlessly. 

Unlike most mainstream finance apps, Kharcha Khata requires **zero login**, uses **no external database servers**, and stores **100% of your financial data securely on your own device** using modern IndexedDB local storage.

---

## ✨ Features

- **Privacy-First Design:** All data (users, budgets, goals, expenses, incomes) never leaves your browser.
- **Progressive Web App (PWA):** Install it directly to your phone's home screen natively from the browser without needing an App Store or APK compilation.
- **Glassmorphism UI:** Features a premium, futuristic, dark-mode glass UI engineered with **Framer Motion** and **Tailwind CSS**.
- **Multi-Profile Support:** Manage multiple people (like family members or business accounts) on the same device seamlessly.
- **Comprehensive Dashboards:** Separate views for "Expenses" and "Income" so your finances are never cluttered.
- **Savings Goals:** Set target goals (e.g., "New Laptop") and instantly allocate money into stunning, animated progress bars.
- **Analytics & PDF Exports:** See an automated breakdown of your categorized spending via Recharts, and instantly export beautiful pixel-perfect PDF/JSON data reports to back up your records.
- **Full Internationalization (i18n):** Deep language and currency customization directly in the app.

---

## 🛠️ Tech Stack 

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS (`globals.css`)
- **Animations:** Framer Motion
- **Database:** Dexie.js (IndexedDB Wrapper)
- **Charts:** Recharts
- **Icons:** Lucide React
- **PWA Manager:** `next-pwa`
- **PDF Generation:** `jspdf` & `jspdf-autotable`

---

## 🚀 Getting Started Locally

To run Kharcha Khata on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/kharcha-khata.git
   cd kharcha-khata
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🌎 Deploying the Application

Because Kharcha Khata is completely client-side and requires no strict backend or external databases, it's incredibly easy and **100% free to deploy**.

### The Vercel Way (Recommended)
1. Push your code to a new repository on GitHub.
2. Sign in to [Vercel.com](https://vercel.com/) (the creators of Next.js).
3. Click "Add New Project" and import your `kharcha-khata` repository.
4. Click **Deploy**. Vercel will install dependencies, generate the PWA service workers, and provide you with a live, highly-available HTTPS URL. 

*Once deployed to Vercel, open the link on your mobile browser (Safari/Chrome) and add it to your Home Screen to unlock the full native App experience.*

---

## 🔒 Security & Data Note
Because your data is stored offline via the browser's IndexedDB, clearing your browser's site data/cache *will* erase your transaction history. It is highly recommended to frequently use the **JSON Export Data** button under the app's `Settings` page to maintain secure off-device backups.
