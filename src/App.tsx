import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";

import Index from "./pages/Index";
import NossoTrabalho from "./pages/NossoTrabalho";
import Transparencia from "./pages/Transparencia";
import Noticias from "./pages/Noticias";
import MaterialTecnico from "./pages/MaterialTecnico";
import PrestacaoContas from "./pages/PrestacaoContas";
import Participe from "./pages/Participe";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";

// Admin pages (lazy loaded)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminTransparency = lazy(() => import("./pages/admin/AdminTransparency"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminEmailMarketing = lazy(() => import("./pages/admin/AdminEmailMarketing"));

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

const AdminFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50">
    <div className="space-y-4 w-full max-w-md p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

const AdminPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<AdminFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/nosso-trabalho" element={<NossoTrabalho />} />
              <Route path="/transparencia" element={<Transparencia />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/material-tecnico" element={<MaterialTecnico />} />
              <Route path="/prestacao-de-contas" element={<PrestacaoContas />} />
              <Route path="/como-apoiar" element={<Participe />} />
              <Route path="/participe" element={<Participe />} />
              <Route path="/contato" element={<Contato />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
              <Route path="/admin/content" element={<AdminPage><AdminContent /></AdminPage>} />
              <Route path="/admin/transparency" element={<AdminPage><AdminTransparency /></AdminPage>} />
              <Route path="/admin/newsletter" element={<AdminPage><AdminNewsletter /></AdminPage>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
