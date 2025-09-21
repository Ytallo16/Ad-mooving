import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Inscricoes from "./pages/Inscricoes";
import Patrocinadores from "./pages/Patrocinadores";
import Percurso from "./pages/Percurso";
import Pagamento from "./pagamento/index";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoCancelado from "./pages/PagamentoCancelado";
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
          <Route path="/inscricoes" element={<Inscricoes />} />
          <Route path="/patrocinadores" element={<Patrocinadores />} />
          <Route path="/percurso" element={<Percurso />} />
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
