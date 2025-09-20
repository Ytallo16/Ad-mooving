import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Inscricoes = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    cpf: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    modality: "ADULTO",
    shirt_size: "",
    athlete_declaration: false
  });



  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };



  const getShirtSizes = () => {
    if (formData.modality === 'INFANTIL') {
      return [
        { value: '2', label: '2 anos' },
        { value: '4', label: '4 anos' },
        { value: '6', label: '6 anos' },
        { value: '8', label: '8 anos' },
        { value: '10', label: '10 anos' },
        { value: '12', label: '12 anos' },
        { value: '14', label: '14 anos' },
        { value: '16', label: '16 anos' },
      ];
    } else if (formData.gender === 'F') {
      return [
        { value: 'PP', label: 'PP (Babylook)' },
        { value: 'P', label: 'P (Babylook)' },
        { value: 'M', label: 'M (Babylook)' },
        { value: 'G', label: 'G (Babylook)' },
        { value: 'GG', label: 'GG (Babylook)' },
        { value: 'XG', label: 'XG (Babylook)' },
        { value: 'XXG', label: 'XXG (Babylook)' },
      ];
    } else {
      return [
        { value: 'PP', label: 'PP' },
        { value: 'P', label: 'P' },
        { value: 'M', label: 'M' },
        { value: 'G', label: 'G' },
        { value: 'GG', label: 'GG' },
        { value: 'XG', label: 'XG' },
        { value: 'XXG', label: 'XXG' },
      ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.athlete_declaration) {
      toast({
        title: "Erro na inscrição",
        description: "Você deve marcar a declaração de responsabilidade para prosseguir.",
        variant: "destructive"
      });
      return;
    }

    const age = calculateAge(formData.birth_date);
    if (age < 12) {
      toast({
        title: "Erro na inscrição",
        description: "O atleta deve ter pelo menos 12 anos para se inscrever.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const apiBaseUrl = 'https://api.admoving.demo.addirceu.com.br';

      console.log('API base usada:', apiBaseUrl);

      const response = await fetch(`${apiBaseUrl}/api/race-registrations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Inscrição realizada com sucesso! 🎉",
          description: "Você receberá um email de confirmação em breve com todos os detalhes.",
        });
        
        // Resetar o formulário
        setFormData({
          full_name: "",
          cpf: "",
          email: "",
          phone: "",
          birth_date: "",
          gender: "",
          modality: "ADULTO",
          shirt_size: "",
          athlete_declaration: false
        });
      } else {
        const errorData = await response.json();
        let errorMessage = "Erro ao processar inscrição. Tente novamente.";
        
        if (errorData.cpf && errorData.cpf[0]) {
          errorMessage = "CPF já cadastrado ou inválido.";
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }
        
        toast({
          title: "Erro na inscrição",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com o servidor. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-detectar modalidade baseada na idade
      if (field === 'birth_date' && typeof value === 'string') {
        const age = calculateAge(value);
        if (age > 0 && age < 18) {
          newData.modality = 'INFANTIL';
        } else if (age >= 18) {
          newData.modality = 'ADULTO';
        }
        // Resetar tamanho da camisa quando mudar modalidade
        newData.shirt_size = '';
      }
      
      // Resetar tamanho da camisa quando mudar gênero ou modalidade
      if (field === 'gender' || field === 'modality') {
        newData.shirt_size = '';
      }
      
      return newData;
    });
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cleanValue.substring(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleanValue.substring(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
      
      {/* Padrão de círculos flutuantes - reduzido para melhor performance */}
      <div className="absolute left-4 top-1/4 w-3 h-3 bg-race-primary/30 rounded-full animate-pulse-slow"></div>
      <div className="absolute left-8 top-1/2 w-2 h-2 bg-race-secondary/40 rounded-full animate-pulse-slow delay-500"></div>
      
      <div className="absolute right-4 top-1/3 w-3 h-3 bg-race-primary/30 rounded-full animate-pulse-slow delay-300"></div>
      <div className="absolute right-8 top-2/3 w-2 h-2 bg-race-secondary/40 rounded-full animate-pulse-slow delay-800"></div>
      
      {/* Elementos geométricos - reduzidos */}
      <div className="absolute top-32 left-16 w-8 h-8 border-2 border-race-primary/20 rotate-45 animate-pulse-slow"></div>
      <div className="absolute bottom-32 right-24 w-6 h-6 border border-race-primary/15 rounded-full animate-pulse-slow delay-1000"></div>
      
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
                    <span className="text-sm text-muted-foreground">15 de Dezembro, 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Horário:</span>
                    <span className="text-sm text-muted-foreground">07:00h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Local:</span>
                    <span className="text-sm text-muted-foreground">Parque Potycabana</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Modalidades:</span>
                    <span className="text-sm text-muted-foreground">Infantil e Adulto</span>
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
                        <Label htmlFor="full_name">Nome Completo *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
                          placeholder="Seu nome completo"
                          required
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          value={formatCPF(formData.cpf)}
                          onChange={(e) => handleInputChange("cpf", e.target.value.replace(/\D/g, ''))}
                          placeholder="000.000.000-00"
                          required
                          maxLength={14}
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                        <Input
                          id="phone"
                          value={formatPhone(formData.phone)}
                          onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ''))}
                          placeholder="(11) 99999-9999"
                          required
                          maxLength={15}
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Nascimento *</Label>
                        <DatePicker
                          value={formData.birth_date}
                          onChange={(date) => handleInputChange("birth_date", date)}
                          placeholder="Selecione sua data de nascimento"
                          className="border-race-primary-light/30 focus:border-race-primary"
                          maxDate={new Date().toISOString().split('T')[0]}
                          minDate="1920-01-01"
                        />
                        {formData.birth_date && (
                          <p className="text-xs text-muted-foreground">
                            Idade: {calculateAge(formData.birth_date)} anos
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Sexo *</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger className="border-race-primary-light/30 focus:border-race-primary">
                            <SelectValue placeholder="Selecione o sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="modality">Modalidade *</Label>
                        <Select value={formData.modality} onValueChange={(value) => handleInputChange("modality", value)}>
                          <SelectTrigger className="border-race-primary-light/30 focus:border-race-primary">
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADULTO">Adulto</SelectItem>
                            <SelectItem value="INFANTIL">Infantil</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.birth_date && calculateAge(formData.birth_date) < 18 && formData.modality === 'ADULTO' && (
                          <p className="text-xs text-amber-600">
                            Sugestão: Modalidade infantil para menores de 18 anos
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="shirt_size">Tamanho da Camisa *</Label>
                        <Select value={formData.shirt_size} onValueChange={(value) => handleInputChange("shirt_size", value)}>
                          <SelectTrigger className="border-race-primary-light/30 focus:border-race-primary">
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            {getShirtSizes().map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.gender === 'F' && formData.modality === 'ADULTO' && (
                          <p className="text-xs text-muted-foreground">
                            Camisetas femininas são do tipo babylook
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-race-primary-light/15 to-race-secondary-light/5 p-6 rounded-lg border border-race-primary-light/20">
                      <h3 className="font-semibold text-race-primary mb-3 text-lg">Informações importantes:</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span>Inclui kit do corredor com camiseta</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span>Hidratação durante o percurso</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span>Medalha para todos os participantes</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-race-primary rounded-full"></div>
                          <span>Idade mínima: 12 anos</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <Checkbox
                        id="athlete_declaration"
                        checked={formData.athlete_declaration}
                        onCheckedChange={(checked) => handleInputChange("athlete_declaration", checked as boolean)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="athlete_declaration" className="text-sm font-medium cursor-pointer">
                          Declaração de Responsabilidade *
                        </Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Eu, atleta inscrito, assumo e expressamente declaro que sou conhecedor do meu estado de saúde e 
                          capacidade atlética e que treinei adequadamente para o evento. Declaro ainda que estou ciente dos 
                          riscos inerentes à prática esportiva e isento os organizadores de qualquer responsabilidade.
                        </p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      size="lg"
                    >
                      {isLoading ? "Processando..." : "Finalizar Inscrição"}
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