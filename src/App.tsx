import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { initReminders } from "@/lib/reminders";
import { applyTheme, getStoredTheme } from "@/components/ThemeToggle";
import { applySeasonalTheme, getStoredSeasonalTheme } from "@/lib/seasonalThemes";
import { preloadSounds } from "@/lib/sounds";
import InstallPrompt from "@/components/InstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const KidSelection = lazy(() => import("./pages/KidSelection"));
const KidTracker = lazy(() => import("./pages/KidTracker"));
const RewardsScreen = lazy(() => import("./pages/RewardsScreen"));
const RewardShop = lazy(() => import("./pages/RewardShop"));
const AchievementsScreen = lazy(() => import("./pages/AchievementsScreen"));
const Azkar = lazy(() => import("./pages/Azkar"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
      />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/kids" element={<KidSelection />} />
            <Route path="/tracker/:childId" element={<KidTracker />} />
            <Route path="/shop/:childId" element={<RewardShop />} />
            <Route path="/rewards/:childId" element={<RewardsScreen />} />
            <Route path="/achievements/:childId" element={<AchievementsScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => {
  useEffect(() => {
    applyTheme(getStoredTheme());
    applySeasonalTheme(getStoredSeasonalTheme());
    initReminders();
    const onFirst = () => { preloadSounds(); window.removeEventListener('pointerdown', onFirst); };
    window.addEventListener('pointerdown', onFirst, { once: true });
    return () => window.removeEventListener('pointerdown', onFirst);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
