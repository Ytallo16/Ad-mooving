import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, RefreshCw, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstagramFloat from "@/components/InstagramFloat";

const PagamentoCancelado = () => {
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registration_id');

  const handleTryAgain = () => {
    // Redirecionar para a página de inscrições
    window.location.href = '/inscricoes';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      <Navbar />
      
      <div className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-2xl border-red-200 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-white">
                Pagamento Cancelado
              </CardTitle>
              <CardDescription className="text-red-100">
                O pagamento não foi processado
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Não se preocupe!
                </h2>
                <p className="text-gray-600 mb-6">
                  Sua inscrição foi salva, mas o pagamento não foi concluído. 
                  Você pode tentar novamente a qualquer momento.
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-orange-800 mb-4">
                  O que aconteceu?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• O pagamento foi cancelado ou interrompido</li>
                  <li>• Suas informações de inscrição foram preservadas</li>
                  <li>• Você pode tentar o pagamento novamente</li>
                  <li>• Sua vaga está reservada por 24 horas</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Precisa de Ajuda?
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Entre em contato conosco:</p>
                  <p><strong>WhatsApp:</strong> +55 86 9410-8906</p>
                  <p><strong>Email:</strong> contato@ad-mooving.com</p>
                  <p>Horário de atendimento: 8h às 18h</p>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">
                  Formas de Pagamento Aceitas:
                </h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Cartão de crédito (Visa, Mastercard, Elo)</li>
                  <li>• Cartão de débito</li>
                  <li>• PIX (disponível no checkout)</li>
                  <li>• Parcelamento em até 12x sem juros</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleTryAgain}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="flex-1 border-race-primary text-race-primary hover:bg-race-primary hover:text-white"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Link>
                </Button>
              </div>

              {registrationId && (
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    ID da inscrição: {registrationId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Guarde este número para facilitar o atendimento
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

export default PagamentoCancelado;
