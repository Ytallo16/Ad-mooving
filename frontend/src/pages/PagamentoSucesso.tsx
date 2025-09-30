import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstagramFloat from "@/components/InstagramFloat";
import { API_CONFIG } from "@/config/api";

const PagamentoSucesso = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        const primary = API_CONFIG.PRIMARY_BASE_URL;
        const fallback = API_CONFIG.FALLBACK_BASE_URL;
        let base = primary;
        try {
          await fetch(primary + '/api/health/', { method: 'GET', signal: AbortSignal.timeout(3000) });
        } catch {
          base = fallback;
        }
        const response = await fetch(`${base}/api/payment/verify-status/?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.success && data.payment_status === 'paid') {
          setPaymentVerified(true);
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  if (!paymentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Pagamento não confirmado</h1>
          <p className="text-red-500 mb-6">Não foi possível verificar o status do seu pagamento.</p>
          <Button asChild>
            <Link to="/inscricoes">Tentar Novamente</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="container mx-auto max-w-md">
          <Card className="shadow-2xl border-green-200 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-6">
              {/* Animação de sucesso */}
              <div className="relative">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 bg-green-500 rounded-full mx-auto animate-ping opacity-20"></div>
              </div>

              {/* Título */}
              <div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Pagamento Confirmado! 🎉
                </h1>
                <p className="text-gray-600 text-lg">
                  Sua inscrição foi processada com sucesso
                </p>
              </div>

              {/* Informações básicas */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>📧 Email de confirmação:</strong> Enviado para seu email
                </p>
                <p className="text-sm text-gray-600">
                  <strong>📦 Kit de corrida:</strong> Informações por email
                </p>
                <p className="text-sm text-gray-600">
                  <strong>📅 Data do evento:</strong> 14 de Dezembro de 2025
                </p>
              </div>

              {/* Botão único */}
              <Button 
                asChild 
                size="lg"
                className="w-full bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark text-lg py-6"
              >
                <Link to="/">
                  <Home className="w-5 h-5 mr-2" />
                  Voltar ao Início
                </Link>
              </Button>

              {/* ID da transação (opcional) */}
              {sessionId && (
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    ID: {sessionId.substring(0, 20)}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
      <InstagramFloat />
    </div>
  );
};

export default PagamentoSucesso;