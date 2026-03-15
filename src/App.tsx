import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NossoTrabalho from "./pages/NossoTrabalho";
import Transparencia from "./pages/Transparencia";
import Noticias from "./pages/Noticias";
import MaterialTecnico from "./pages/MaterialTecnico";
import PrestacaoContas from "./pages/PrestacaoContas";
import Participe from "./pages/Participe";
import Contato from "./pages/Contato";
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
          <Route path="/nosso-trabalho" element={<NossoTrabalho />} />
          <Route path="/transparencia" element={<Transparencia />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/material-tecnico" element={<MaterialTecnico />} />
          <Route path="/prestacao-de-contas" element={<PrestacaoContas />} />
          <Route path="/como-apoiar" element={<ComoApoiar />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
