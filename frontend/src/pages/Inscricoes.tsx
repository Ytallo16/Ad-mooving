import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Inscricoes = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    categoria: "",
    tamanho_camisa: "",
    contato_emergencia: "",
    observacoes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inscrição realizada com sucesso!",
      description: "Você receberá mais informações em breve por email.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-race-primary-light/40 via-race-primary-light/10 to-white relative overflow-hidden">
      {/* Padrão de fundo geométrico */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-race-primary/30 to-transparent"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-race-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-10 w-80 h-80 bg-race-secondary/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-race-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-60 right-20 w-64 h-64 bg-race-secondary/12 rounded-full blur-2xl"></div>
      </div>
      
      {/* Elementos decorativos laterais */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-race-primary/20 to-transparent"></div>
      <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-race-primary/20 to-transparent"></div>
      
      {/* Padrão de círculos flutuantes */}
      <div className="absolute left-4 top-1/4 w-3 h-3 bg-race-primary/30 rounded-full animate-pulse"></div>
      <div className="absolute left-8 top-1/3 w-2 h-2 bg-race-secondary/40 rounded-full animate-pulse delay-500"></div>
      <div className="absolute left-2 top-1/2 w-4 h-4 bg-race-primary/20 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute left-6 top-2/3 w-2 h-2 bg-race-secondary/35 rounded-full animate-pulse delay-700"></div>
      
      <div className="absolute right-4 top-1/4 w-3 h-3 bg-race-primary/30 rounded-full animate-pulse delay-300"></div>
      <div className="absolute right-8 top-1/3 w-2 h-2 bg-race-secondary/40 rounded-full animate-pulse delay-800"></div>
      <div className="absolute right-2 top-1/2 w-4 h-4 bg-race-primary/20 rounded-full animate-pulse delay-200"></div>
      <div className="absolute right-6 top-2/3 w-2 h-2 bg-race-secondary/35 rounded-full animate-pulse delay-1200"></div>
      
      {/* Elementos geométricos */}
      <div className="absolute top-32 left-16 w-8 h-8 border-2 border-race-primary/20 rotate-45 animate-pulse"></div>
      <div className="absolute top-96 right-16 w-6 h-6 border-2 border-race-secondary/25 rotate-12 animate-pulse delay-500"></div>
      <div className="absolute bottom-32 left-24 w-10 h-10 border border-race-primary/15 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-96 right-24 w-5 h-5 bg-race-primary/10 rotate-45 animate-pulse delay-700"></div>
      
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block p-1 bg-gradient-to-r from-race-primary to-race-secondary rounded-full mb-6">
              <div className="bg-white rounded-full px-6 py-2">
                <span className="text-sm font-semibold text-race-primary">Inscrições Abertas</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-race-primary mb-6 bg-gradient-to-r from-race-primary to-race-secondary bg-clip-text text-transparent">
              Inscrições ADMOOVING
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Preencha o formulário abaixo para se inscrever na corrida e fazer parte desta experiência única
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar com informações */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-gradient-to-br from-race-primary to-race-secondary text-white border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Por que participar?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Experiência única de fé e movimento</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Kit completo do corredor</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Medalha para todos os participantes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Apoio da comunidade</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-race-primary-light bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-race-primary">Informações do Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data:</span>
                    <span className="text-sm text-muted-foreground">15 de Março, 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Horário:</span>
                    <span className="text-sm text-muted-foreground">6:00 às 11:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Local:</span>
                    <span className="text-sm text-muted-foreground">Parque da Igreja</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa:</span>
                    <span className="text-sm text-muted-foreground">R$ 25,00</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Formulário principal */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-race-primary-light bg-white/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-race-primary to-race-secondary text-white">
                  <CardTitle className="text-white text-xl">Formulário de Inscrição</CardTitle>
                  <CardDescription className="text-white/90">
                    Todas as informações são obrigatórias
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => handleInputChange("nome", e.target.value)}
                          placeholder="Seu nome completo"
                          required
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="seu@email.com"
                          required
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange("telefone", e.target.value)}
                          placeholder="(11) 99999-9999"
                          required
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                          <SelectTrigger className="border-race-primary-light/30 focus:border-race-primary">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5km">5km - Corrida</SelectItem>
                            <SelectItem value="10km">10km - Corrida</SelectItem>
                            <SelectItem value="3km-caminhada">3km - Caminhada</SelectItem>
                            <SelectItem value="kids">Kids - Infantil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tamanho_camisa">Tamanho da Camisa</Label>
                        <Select value={formData.tamanho_camisa} onValueChange={(value) => handleInputChange("tamanho_camisa", value)}>
                          <SelectTrigger className="border-race-primary-light/30 focus:border-race-primary">
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PP">PP</SelectItem>
                            <SelectItem value="P">P</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="G">G</SelectItem>
                            <SelectItem value="GG">GG</SelectItem>
                            <SelectItem value="XGG">XGG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contato_emergencia">Contato de Emergência</Label>
                        <Input
                          id="contato_emergencia"
                          value={formData.contato_emergencia}
                          onChange={(e) => handleInputChange("contato_emergencia", e.target.value)}
                          placeholder="Nome e telefone"
                          required
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações (opcional)</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange("observacoes", e.target.value)}
                        placeholder="Alguma informação adicional..."
                        rows={3}
                        className="border-race-primary-light/30 focus:border-race-primary resize-none"
                      />
                    </div>

                    <div className="bg-gradient-to-r from-race-primary-light/15 to-race-secondary-light/5 p-6 rounded-lg border border-race-primary-light/20">
                      <h3 className="font-semibold text-race-primary mb-3 text-lg">Informações importantes:</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span className="font-29lt">Taxa de inscrição: R$ 25,00</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span className="font-29lt">Inclui kit do corredor com camiseta</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span className="font-29lt">Hidratação durante o percurso</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span className="font-29lt">Medalha para todos os participantes</span>
                        </li>
                      </ul>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 font-29lt"
                      size="lg"
                    >
                      Finalizar Inscrição
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscricoes;