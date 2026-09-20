import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContractLensProvider } from "./components/ContractLensContext";
import { AuthProvider, RequireAuth } from "./components/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import UploadContract from "./pages/UploadContract";
import ContractDetail from "./pages/ContractDetail";
import Compare from "./pages/Compare";
import Obligations from "./pages/Obligations";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ContractLensProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/contracts" element={<RequireAuth><Contracts /></RequireAuth>} />
              <Route path="/contracts/upload" element={<RequireAuth><UploadContract /></RequireAuth>} />
              <Route path="/contracts/:id" element={<RequireAuth><ContractDetail /></RequireAuth>} />
              <Route path="/compare" element={<RequireAuth><Compare /></RequireAuth>} />
              <Route path="/obligations" element={<RequireAuth><Obligations /></RequireAuth>} />
              <Route path="/alerts" element={<RequireAuth><Alerts /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ContractLensProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
