import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Inscricoes from "./pages/Inscricoes";
import Patrocinadores from "./pages/Patrocinadores";
import Sobre from "./pages/Sobre";
import Pagamento from "./pagamento/index";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoCancelado from "./pages/PagamentoCancelado";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Reset scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inscricoes" element={<Inscricoes />} />
          <Route path="/patrocinadores" element={<Patrocinadores />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
          <Route path="/pagamento/cancelado" element={<PagamentoCancelado />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
