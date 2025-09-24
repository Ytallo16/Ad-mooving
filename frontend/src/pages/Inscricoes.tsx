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

import { useNavigate } from "react-router-dom";

const Inscricoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do atleta/criança
    full_name: "",
    cpf: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    // Percurso e modalidade derivada
    course: "RUN_5K", // KIDS | RUN_5K | WALK_3K
    modality: "ADULTO", // ADULTO | INFANTIL (deriva do course)
    // Camiseta
    shirt_size: "",
    // Responsável (usado quando course == KIDS)
    responsible_full_name: "",
    responsible_cpf: "",
    responsible_email: "",
    responsible_phone: "",
    // Declaração
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
    if (formData.course === 'KIDS' || formData.modality === 'INFANTIL') {
      return [
        { value: '4', label: '4 anos' },
        { value: '6', label: '6 anos' },
        { value: '8', label: '8 anos' },
        { value: '10', label: '10 anos' },
      ];
    }
    return [
      { value: 'PP', label: 'Tradicional PP' },
      { value: 'P', label: 'Tradicional P' },
      { value: 'M', label: 'Tradicional M' },
      { value: 'G', label: 'Tradicional G' },
      { value: 'GG', label: 'Tradicional GG' },
      { value: 'XG', label: 'Tradicional XG' },
      { value: 'XXG', label: 'Tradicional XXG' },
    ];
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
    if ((formData.course === 'RUN_5K' || formData.course === 'WALK_3K') && age < 12) {
      toast({
        title: "Erro na inscrição",
        description: "O atleta deve ter pelo menos 12 anos para se inscrever.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const apiBaseUrl = 'http://127.0.0.1:8000'; // URL local para desenvolvimento
      
      console.log('API base usada:', apiBaseUrl);
      console.log('Dados enviados:', formData);

      const payload = {
        ...formData,
        modality: formData.course === 'KIDS' ? 'INFANTIL' : 'ADULTO',
        // Para KIDS, email/phone podem ser do responsável
        email: formData.course === 'KIDS' && formData.responsible_email ? formData.responsible_email : formData.email,
        phone: formData.course === 'KIDS' && formData.responsible_phone ? formData.responsible_phone : formData.phone,
      };

      const response = await fetch(`${apiBaseUrl}/api/race-registrations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resultado da API:', result);
        
        // Verificar se há dados de pagamento na resposta
        if (result.payment && result.payment.checkout_url) {
          toast({
            title: "Inscrição realizada com sucesso! 🎉",
            description: "Redirecionando para o pagamento...",
          });
          
          // Aguardar um momento para o usuário ver a mensagem
          setTimeout(() => {
            // Redirecionar para o Stripe Checkout
            window.location.href = result.payment.checkout_url;
          }, 1500);
          
        } else if (result.registration) {
          // Caso a inscrição foi criada mas sem pagamento
          toast({
            title: "Inscrição realizada! ⚠️",
            description: "Inscrição criada mas houve um problema com o pagamento. Entre em contato conosco.",
            variant: "destructive"
          });
        } else {
          // Resposta padrão (compatibilidade com versão antiga)
          toast({
            title: "Inscrição realizada com sucesso! 🎉",
            description: "Você receberá um email de confirmação em breve com todos os detalhes.",
          });
        }
        
        // Resetar o formulário
        setFormData({
          full_name: "",
          cpf: "",
          email: "",
          phone: "",
          birth_date: "",
          gender: "",
          course: "RUN_5K",
          modality: "ADULTO",
          shirt_size: "",
          responsible_full_name: "",
          responsible_cpf: "",
          responsible_email: "",
          responsible_phone: "",
          athlete_declaration: false
        });
      } else {
        const errorData = await response.json();
        console.error('Erro da API:', errorData);
        
        let errorMessage = "Erro ao processar inscrição. Tente novamente.";
        
        if (errorData.cpf && errorData.cpf[0]) {
          errorMessage = "CPF já cadastrado ou inválido.";
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        
        toast({
          title: "Erro na inscrição",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com o servidor. Verifique se o backend está rodando.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData: any = { ...prev, [field]: value };
      
      // Sincronizar modalidade a partir do percurso
      if (field === 'course') {
        newData.modality = value === 'KIDS' ? 'INFANTIL' : 'ADULTO';
        newData.shirt_size = '';
      }

      // Resetar tamanho da camisa quando mudar gênero
      if (field === 'gender') {
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
      
      {/* Patrocinadores - Lateral Esquerda */}
      <div className="hidden xl:block fixed left-4 top-32 bottom-8 w-32 z-[1000]">
        <div className="h-full flex flex-col justify-center">
          <div className="text-center mb-4">
            <h3 className="text-sm font-semibold text-race-primary transform -rotate-90 whitespace-nowrap">PATROCINADORES</h3>
          </div>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`sponsor-left-${i}`} className="w-full h-20 bg-white/90 border border-gray-200 rounded-xl shadow-lg flex items-center justify-center overflow-hidden hover:shadow-xl transition-shadow">
                {/* Substitua por: <img src="/logos/patrocinador.png" alt="Patrocinador" className="w-full h-full object-contain p-2" /> */}
                <span className="text-xs text-gray-500">Logo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patrocinadores - Lateral Direita */}
      <div className="hidden xl:block fixed right-4 top-32 bottom-8 w-32 z-[1000]">
        <div className="h-full flex flex-col justify-center">
          <div className="text-center mb-4">
            <h3 className="text-sm font-semibold text-race-primary transform rotate-90 whitespace-nowrap">APOIADORES</h3>
          </div>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`sponsor-right-${i}`} className="w-full h-20 bg-white/90 border border-gray-200 rounded-xl shadow-lg flex items-center justify-center overflow-hidden hover:shadow-xl transition-shadow">
                {/* Substitua por: <img src="/logos/apoiador.png" alt="Apoiador" className="w-full h-full object-contain p-2" /> */}
                <span className="text-xs text-gray-500">Logo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
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
                    <span className="text-sm">Contribuir com a obra missionária</span>
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
                        <Label htmlFor="full_name">{formData.course==='KIDS' ? 'Nome completo da criança *' : 'Nome Completo *'}</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
                          placeholder="Seu nome completo"
                          required
                          className="border-race-primary-light/30 focus:border-race-primary"
                        />
                      </div>
                      {formData.course !== 'KIDS' && (
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
                      )}
                    </div>

                    {formData.course !== 'KIDS' && (
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
                    )}

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
                        <Label htmlFor="course">Percurso *</Label>
                        <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)}>
                          <SelectTrigger className="border-race-primary-light/30 focus:border-race-primary">
                            <SelectValue placeholder="Selecione o percurso" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KIDS">Kids</SelectItem>
                            <SelectItem value="RUN_5K">5KM (Corrida)</SelectItem>
                            <SelectItem value="WALK_3K">3KM (Caminhada)</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <p className="text-xs text-muted-foreground">{formData.course==='KIDS' ? 'Tamanhos infantis 4, 6, 8, 10 anos' : 'Tamanhos adulto: Tradicional PP a XXG'}</p>
                      </div>
                    </div>

                    {formData.course === 'KIDS' && (
                      <div className="space-y-4 p-4 rounded-lg border border-race-primary-light/30 bg-white/70">
                        <h3 className="font-semibold text-race-primary">Dados do Responsável</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="responsible_full_name">Nome do Responsável *</Label>
                            <Input id="responsible_full_name" value={formData.responsible_full_name} onChange={(e)=>handleInputChange('responsible_full_name', e.target.value)} required={formData.course==='KIDS'} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsible_cpf">CPF do Responsável *</Label>
                            <Input id="responsible_cpf" value={formatCPF(formData.responsible_cpf)} onChange={(e)=>handleInputChange('responsible_cpf', e.target.value.replace(/\D/g,''))} placeholder="000.000.000-00" required={formData.course==='KIDS'} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsible_email">Email do Responsável *</Label>
                            <Input id="responsible_email" type="email" value={formData.responsible_email} onChange={(e)=>handleInputChange('responsible_email', e.target.value)} required={formData.course==='KIDS'} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsible_phone">Telefone do Responsável *</Label>
                            <Input id="responsible_phone" value={formatPhone(formData.responsible_phone)} onChange={(e)=>handleInputChange('responsible_phone', e.target.value.replace(/\D/g,''))} placeholder="(11) 99999-9999" required={formData.course==='KIDS'} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Aviso de doação de alimento */}
                    <div className="p-5 rounded-lg border border-amber-300 bg-amber-50">
                      <h3 className="font-semibold text-amber-800 mb-2">Corrida e Caminhada</h3>
                      <p className="text-sm text-amber-900">+ 1kg de alimento não-perecível</p>
                      <p className="text-xs text-amber-800 mt-1">Obs: Os alimentos deverão ser entregues no momento da retirada do kit do atleta.</p>
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