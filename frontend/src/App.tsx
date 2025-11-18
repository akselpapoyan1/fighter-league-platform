import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Divisions from "./pages/Divisions";
import Events from "./pages/Events";
import FighterProfile from "./pages/FighterProfile";
import Fighters from "./pages/Fighters";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import FighterDashboard from "./pages/FighterDashboard";
import SponsorDashboard from "./pages/SponsorDashboard";
import RoleSelectionPage from "./pages/RoleSelectionPage";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/fighters" element={<Fighters />} />
            <Route path="/fighter/:id" element={<FighterProfile />} />
            <Route path="/divisions" element={<Divisions />} />
            <Route path="/events" element={<Events />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/fighter" element={<FighterDashboard />} />
            <Route path="/dashboard/guest" element={<RoleSelectionPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
