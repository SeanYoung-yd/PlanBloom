import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomTabBar } from "./BottomTabBar";
import { useSettings } from "../shared/hooks/usePlanBloomData";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { data: settings } = useSettings();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  return (
    <div className="min-h-screen pb-24">
      <main className="mx-auto w-full max-w-[960px] px-4 pb-8 pt-5 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomTabBar />
    </div>
  );
}
