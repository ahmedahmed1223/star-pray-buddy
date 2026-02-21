import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ParentDashboard from "./pages/ParentDashboard";
import KidSelection from "./pages/KidSelection";
import KidTracker from "./pages/KidTracker";
import RewardsScreen from "./pages/RewardsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
