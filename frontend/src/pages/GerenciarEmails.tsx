import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Search, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { apiRequest } from "@/config/api";

interface Registration {
  id: number;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  course_display: string;
  registration_number: string;
  payment_date: string | null;
  payment_email_sent: boolean;
  created_at: string;
}

export default function GerenciarEmails() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const { toast } = useToast();

  // Carregar inscrições pagas
  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/admin/paid-registrations/');
      const data = await response.json();

      if (data.success) {
        setRegistrations(data.registrations);
        setFilteredRegistrations(data.registrations);
      } else {
        toast({
          title: "Erro ao carregar inscrições",
          description: data.error || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar inscrições",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // Filtrar inscrições por busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRegistrations(registrations);
    } else {
      const filtered = registrations.filter(
        (reg) =>
          reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.cpf.includes(searchTerm) ||
          reg.registration_number.includes(searchTerm)
      );
      setFilteredRegistrations(filtered);
    }
  }, [searchTerm, registrations]);

  // Reenviar email
  const handleResendEmail = async (registrationId: number) => {
    setSendingEmail(registrationId);
    
    try {
      const response = await apiRequest('/api/admin/resend-email/', {
        method: 'POST',
        body: JSON.stringify({ registration_id: registrationId }),
      });
      
      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Email enviado com sucesso!",
          description: "O email de confirmação foi reenviado.",
        });
        
        // Atualizar o status na lista
        setRegistrations(prev =>
          prev.map(reg =>
            reg.id === registrationId
              ? { ...reg, payment_email_sent: true }
              : reg
          )
        );
      } else {
        toast({
          title: "Erro ao enviar email",
          description: data.error || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <Card className="shadow-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  <Mail className="h-8 w-8 text-primary" />
                  Gerenciar Emails de Confirmação
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Lista de inscrições pagas - Reenvie emails de confirmação
                </CardDescription>
              </div>
              <Button
                onClick={loadRegistrations}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar por nome, email, CPF ou número de inscrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total de Inscrições</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {registrations.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 dark:bg-green-950/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Emails Enviados</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {registrations.filter(r => r.payment_email_sent).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Emails Pendentes</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {registrations.filter(r => !r.payment_email_sent).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Carregando inscrições...</span>
              </div>
            ) : (
              <>
                {/* Lista de inscrições */}
                {filteredRegistrations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      {searchTerm ? "Nenhuma inscrição encontrada com esse termo" : "Nenhuma inscrição paga encontrada"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRegistrations.map((reg) => (
                      <Card key={reg.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Informações */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg">{reg.full_name}</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {reg.course_display}
                                    </Badge>
                                    <Badge variant={reg.payment_email_sent ? "default" : "secondary"} className="text-xs">
                                      {reg.payment_email_sent ? (
                                        <>
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Email enviado
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="h-3 w-3 mr-1" />
                                          Email não enviado
                                        </>
                                      )}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div>
                                  <span className="font-medium">Email:</span> {reg.email}
                                </div>
                                <div>
                                  <span className="font-medium">CPF:</span> {reg.cpf}
                                </div>
                                <div>
                                  <span className="font-medium">Telefone:</span> {reg.phone}
                                </div>
                                <div>
                                  <span className="font-medium">Nº Inscrição:</span>{" "}
                                  <span className="font-bold text-primary">{reg.registration_number}</span>
                                </div>
                              </div>
                            </div>

                            {/* Botão de reenviar */}
                            <div className="flex-shrink-0">
                              <Button
                                onClick={() => handleResendEmail(reg.id)}
                                disabled={sendingEmail === reg.id}
                                size="lg"
                                className="w-full md:w-auto"
                              >
                                {sendingEmail === reg.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Reenviar Email
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Rodapé com informações */}
                <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-4">
                  <p>
                    Mostrando {filteredRegistrations.length} de {registrations.length} inscrições
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
