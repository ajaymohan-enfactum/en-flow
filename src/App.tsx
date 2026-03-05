import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import OpportunityDetail from "./pages/OpportunityDetail";
import Accounts from "./pages/Accounts";
import AccountDetail from "./pages/AccountDetail";
import PitchLibrary from "./pages/PitchLibrary";
import Reports from "./pages/Reports";
import AdminSettings from "./pages/AdminSettings";
import ImportTool from "./pages/ImportTool";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/opportunity/:id" element={<OpportunityDetail />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/:id" element={<AccountDetail />} />
              <Route path="/pitch-library" element={<PitchLibrary />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin" element={<AdminSettings />} />
              <Route path="/admin/import" element={<ImportTool />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
