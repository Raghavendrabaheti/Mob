import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/TransactionContext";
import { AppLayout } from "@/components/AppLayout";

// Auth pages
import { Welcome } from "@/pages/auth/Welcome";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";

// App pages
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { AddTransaction } from "@/pages/AddTransaction";
import { Analytics } from "@/pages/Analytics";
import { Profile } from "@/pages/Profile";
import { Categories } from "@/pages/Categories";
import { Events } from "@/pages/Events";
import { Lockups } from "@/pages/Lockups";
import { Savings } from "@/pages/Savings";
import { SplitBorrow } from "@/pages/SplitBorrow";
import { Scanner } from "@/pages/Scanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useApp();
  return state.user ? <>{children}</> : <Navigate to="/auth/welcome" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to welcome */}
            <Route path="/" element={<Navigate to="/auth/welcome" replace />} />
            
            {/* Auth routes */}
            <Route path="/auth/welcome" element={<Welcome />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Protected app routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="add" element={<AddTransaction />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="categories" element={<Categories />} />
              <Route path="events" element={<Events />} />
              <Route path="lockups" element={<Lockups />} />
              <Route path="savings" element={<Savings />} />
              <Route path="split" element={<SplitBorrow />} />
              <Route path="scanner" element={<Scanner />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
