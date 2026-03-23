import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetailsPage from "@/pages/LeadDetails";
import Cars from "./pages/Cars";
import CarForm from "./pages/CarForm";
import Agendamentos from "./pages/Agendamentos";
import Configuracoes from "./pages/Configuracoes";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={<AppLayout><Dashboard /></AppLayout>}
          />
          <Route
            path="/leads"
            element={<AppLayout><Leads /></AppLayout>}
          />
          <Route
            path="/leads/:id"
            element={<AppLayout><LeadDetailsPage /></AppLayout>}
          />
          <Route
            path="/carros"
            element={<AppLayout><Cars /></AppLayout>}
          />
          <Route
            path="/carros/novo"
            element={<AppLayout><CarForm /></AppLayout>}
          />
          <Route
            path="/carros/editar/:id"
            element={<AppLayout><CarForm /></AppLayout>}
          />
          <Route
            path="/agendamentos"
            element={<AppLayout><Agendamentos /></AppLayout>}
          />
          <Route
            path="/configuracoes"
            element={<AppLayout><Configuracoes /></AppLayout>}
          />
          <Route
            path="/relatorios"
            element={<AppLayout><Relatorios /></AppLayout>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
