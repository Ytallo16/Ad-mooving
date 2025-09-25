import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Mail, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";

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
        const primary = 'https://api.admoving.demo.addirceu.com.br';
        const fallback = 'http://127.0.0.1:8000';
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="text-center shadow-xl">
              <CardContent className="pt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-race-primary mx-auto mb-4"></div>
                <p>Verificando seu pagamento...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <Navbar />
      
      <div className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-2xl border-green-200 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-white">
                Pagamento Confirmado! 🎉
              </CardTitle>
              <CardDescription className="text-green-100">
                Sua inscrição foi processada com sucesso
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Parabéns! Você está inscrito na Corrida Ad-mooving!
                </h2>
                <p className="text-gray-600 mb-6">
                  Sua inscrição foi confirmada e o pagamento foi processado com sucesso. 
                  Em breve você receberá um email com todos os detalhes da corrida.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Próximos Passos:
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Verifique seu email para confirmação detalhada</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Retire seu kit nos dias 13 e 14 de dezembro (10h às 18h)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Local de retirada: Loja Ad-mooving - Shopping Morumbi</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Traga CPF e comprovante de inscrição para retirar o kit</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Informações da Corrida:
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Data:</span>
                    <p className="text-gray-600">15 de Dezembro, 2024</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Horário:</span>
                    <p className="text-gray-600">07:00h</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Local:</span>
                    <p className="text-gray-600">Parque Potycabana</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contato:</span>
                    <p className="text-gray-600">+55 86 9410-8906</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  asChild 
                  className="flex-1 bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="flex-1 border-race-primary text-race-primary hover:bg-race-primary hover:text-white"
                >
                  <Link to="/percurso">
                    Ver Percurso
                  </Link>
                </Button>
              </div>

              {sessionId && (
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    ID da transação: {sessionId.substring(0, 20)}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PagamentoSucesso;
