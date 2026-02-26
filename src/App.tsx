import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initReminders } from "@/lib/reminders";
import Index from "./pages/Index";
import ParentDashboard from "./pages/ParentDashboard";
import KidSelection from "./pages/KidSelection";
import KidTracker from "./pages/KidTracker";
import RewardsScreen from "./pages/RewardsScreen";
import AchievementsScreen from "./pages/AchievementsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initReminders();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/kids" element={<KidSelection />} />
            <Route path="/tracker/:childId" element={<KidTracker />} />
            <Route path="/rewards/:childId" element={<RewardsScreen />} />
            <Route path="/achievements/:childId" element={<AchievementsScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
