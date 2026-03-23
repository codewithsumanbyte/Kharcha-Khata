"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { useUsers } from "@/lib/hooks";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronRight, Plus, User } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const users = useUsers();
  const { activeUserId, setActiveUser, isHydrated } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState("");

  // Redirect if we are hydrated, have an active user, and are not explicitly creating a new one
  useEffect(() => {
    if (isHydrated && activeUserId && users && users.length > 0 && !isCreating) {
      // Check if the user exists in DB
      const userExists = users.some(u => u.id === activeUserId);
      if (userExists) {
        router.push("/dashboard");
      } else {
        setActiveUser(null);
      }
    }
  }, [isHydrated, activeUserId, users, router, isCreating, setActiveUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const id = crypto.randomUUID();
    await db.users.add({
      id,
      name: newUserName.trim(),
      createdAt: Date.now(),
    });

    setActiveUser(id);
    router.push("/dashboard");
  };

  const selectUser = (id: string) => {
    setActiveUser(id);
    router.push("/dashboard");
  };

  if (!isHydrated || users === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground/50">Loading...</div>;
  }

  const showUserSelection = users.length > 0 && !isCreating;

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-foreground/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/logo.svg" alt="Kharcha Khata Logo" className="w-20 h-20 mb-6 drop-shadow-xl hover:scale-105 transition-transform duration-500" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kharcha Khata</h1>
          <p className="text-foreground/60">Privacy-first expense tracking.</p>
        </div>

        <AnimatePresence mode="wait">
          {showUserSelection ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-medium text-foreground/50 mb-4 px-2">Select Profile</h2>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectUser(user.id)}
                  className="w-full glass p-4 flex items-center justify-between group hover:bg-foreground/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-foreground/70" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-foreground/70 transition-colors" />
                </button>
              ))}

              <button
                onClick={() => setIsCreating(true)}
                className="w-full glass p-4 flex items-center gap-4 group hover:bg-foreground/10 transition-colors mt-6 border-dashed"
              >
                <div className="w-10 h-10 rounded-full bg-transparent border border-dashed border-foreground/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-foreground/70" />
                </div>
                <span className="font-medium text-foreground/70">Create New Profile</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="creation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Create Profile</h2>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/70">What should we call you?</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="glass-input"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newUserName.trim()}
                  className="w-full bg-foreground text-black font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity hover:opacity-90 active:scale-[0.98]"
                >
                  Get Started
                </button>

                {users.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="w-full text-sm text-foreground/50 hover:text-foreground/90 transition-colors py-2"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
