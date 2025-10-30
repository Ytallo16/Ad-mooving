import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstagramFloat from "@/components/InstagramFloat";
import { CreditCard, Smartphone, Copy, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "@/config/api";

const Inscricoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'pix' | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [pixData, setPixData] = useState<any>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixStatus, setPixStatus] = useState<'pending' | 'checking' | 'paid' | 'expired'>('pending');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponTimeout, setCouponTimeout] = useState<NodeJS.Timeout | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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

  // Prefill course/modality from URL param on mount
  useEffect(() => {
    const courseParam = (searchParams.get('course') || '').toUpperCase();
    const allowed = ['KIDS', 'RUN_5K', 'WALK_3K'];
    if (allowed.includes(courseParam)) {
      setFormData(prev => ({
        ...prev,
        course: courseParam as any,
        modality: courseParam === 'KIDS' ? 'INFANTIL' : 'ADULTO',
        shirt_size: ''
      }));
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



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
        { value: '12', label: '12 anos' },
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

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponMessage("");
      setCouponDiscount(0);
      setIsCouponValid(false);
      return;
    }

    setIsValidatingCoupon(true);
    try {
      console.log('Validando cupom:', code.trim(), 'modalidade:', formData.modality);
      
      const response = await apiRequest('/api/payment/validate-coupon/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coupon_code: code.trim(),
          modality: formData.modality
        }),
      });

      console.log('Resposta da validação:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Resultado da validação:', result);
      
      if (result.valid) {
        setCouponDiscount(result.discount_amount);
        setCouponMessage('Cupom aplicado com sucesso!');
        setIsCouponValid(true);
      } else {
        setCouponDiscount(0);
        setCouponMessage(result.message || "Cupom inválido");
        setIsCouponValid(false);
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setCouponDiscount(0);
      setCouponMessage("Erro ao validar cupom");
      setIsCouponValid(false);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCouponChange = (value: string) => {
    setCouponCode(value);
    
    // Limpar timeout anterior
    if (couponTimeout) {
      clearTimeout(couponTimeout);
    }
    
    // Limpar mensagens quando usuário digita
    if (!value.trim()) {
      setCouponMessage("");
      setCouponDiscount(0);
      setIsCouponValid(false);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      validateCoupon(couponCode.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!formData.athlete_declaration) {
      setFormErrors(prev => ({ ...prev, athlete_declaration: 'Você deve marcar a declaração de responsabilidade.' }));
      return;
    }

    const age = calculateAge(formData.birth_date);
    if ((formData.course === 'RUN_5K' || formData.course === 'WALK_3K') && age < 12) {
      setFormErrors(prev => ({ ...prev, birth_date: 'Para 5KM/3KM o atleta deve ter ao menos 12 anos.' }));
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Dados enviados (raw):', formData);

      // Sanitização forte no envio
      const sanitizedCpf = (formData.cpf || '').toString().replace(/\D/g, '').slice(0, 11);
      const sanitizedResponsibleCpf = (formData.responsible_cpf || '').toString().replace(/\D/g, '').slice(0, 11);

      // Validações básicas no cliente
      const clientErrors: Record<string, string> = {};
      if (!formData.full_name?.trim()) clientErrors.full_name = 'Informe seu nome completo.';
      if (formData.course !== 'KIDS' && sanitizedCpf.length !== 11) clientErrors.cpf = 'CPF deve ter 11 dígitos.';
      if (formData.course !== 'KIDS' && (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))) clientErrors.email = 'Informe um email válido.';
      if (formData.course !== 'KIDS') {
        const phoneDigits = (formData.phone || '').replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) clientErrors.phone = 'Telefone deve ter 10 ou 11 dígitos.';
      }
      if (!formData.birth_date) clientErrors.birth_date = 'Informe sua data de nascimento.';
      if (!formData.gender) clientErrors.gender = 'Selecione o sexo.';
      if (!formData.course) clientErrors.course = 'Selecione o percurso.';
      if (!formData.shirt_size) clientErrors.shirt_size = 'Selecione o tamanho da camisa.';
      if (formData.course === 'KIDS') {
        if (!formData.responsible_full_name?.trim()) clientErrors.responsible_full_name = 'Informe o nome do responsável.';
        if (!(formData.responsible_cpf || '').toString().replace(/\D/g, '').slice(0, 11)) clientErrors.responsible_cpf = 'Informe o CPF do responsável.';
        if (!formData.responsible_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.responsible_email)) clientErrors.responsible_email = 'Informe um email válido do responsável.';
        const respPhoneDigits = (formData.responsible_phone || '').replace(/\D/g, '');
        if (respPhoneDigits.length < 10 || respPhoneDigits.length > 11) clientErrors.responsible_phone = 'Telefone deve ter 10 ou 11 dígitos.';
      }
      if (Object.keys(clientErrors).length) {
        setFormErrors(clientErrors);
        const firstKey = Object.keys(clientErrors)[0];
        const el = document.getElementById(firstKey);
        if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsLoading(false);
        return;
      }

      const payload: any = {
        ...formData,
        cpf: formData.course === 'KIDS' ? (sanitizedResponsibleCpf || undefined) : (sanitizedCpf || undefined),
        responsible_cpf: formData.course === 'KIDS' ? sanitizedResponsibleCpf || undefined : undefined,
        modality: formData.course === 'KIDS' ? 'INFANTIL' : 'ADULTO',
        // Para KIDS, email/phone podem ser do responsável
        email: formData.course === 'KIDS' && formData.responsible_email ? formData.responsible_email : formData.email,
        phone: formData.course === 'KIDS' && formData.responsible_phone ? formData.responsible_phone : formData.phone,
      };
      
      // Enviar SEMPRE o cupom digitado (backend valida e aplica desconto)
      if (couponCode.trim()) {
        payload.coupon_code = couponCode.trim().toUpperCase();
      }
      
      console.log('Payload sanitizado:', payload);
      console.log('DEBUG FRONTEND: Cupom válido?', isCouponValid, 'Código:', couponCode);

      const response = await apiRequest(`/api/race-registrations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let parsedJson: any = null;
      let rawText: string | null = null;
      try {
        parsedJson = await response.clone().json();
      } catch (_) {
        try { rawText = await response.text(); } catch (__) { rawText = null; }
      }

      console.log('Resposta da API -> status:', response.status, 'ok:', response.ok);
      if (parsedJson) console.log('Resultado da API (JSON):', parsedJson);
      if (!parsedJson && rawText) console.log('Resultado da API (texto):', rawText);

      if (response.ok && parsedJson) {
        const result = parsedJson;
        console.log('Resultado da API:', result);
        
        // Se backend marcou como auto pago (cupom 100%), pular pagamento e mostrar modal de gratuidade
        if (result?.payment?.auto_paid) {
          setRegistrationData(result);
          setShowFreeModal(true);
          // Resetar formulário
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
          setCouponCode("");
          setCouponDiscount(0);
          setIsCouponValid(false);
          return;
        }

        // Salvar dados da inscrição e mostrar modal de pagamento
        setRegistrationData(result);
        setShowPaymentModal(true);
        
        toast({
          title: "Inscrição realizada com sucesso! 🎉",
          description: "Escolha sua forma de pagamento para finalizar.",
        });
        
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
        const errorData = parsedJson || rawText || 'Erro desconhecido';
        console.error('Erro da API:', errorData);
        
        let errorMessage = "Corrija os campos destacados e tente novamente.";
        const aggregatedErrors: Record<string, string> = {};
        if (errorData && typeof errorData === 'object') {
          Object.entries(errorData as Record<string, any>).forEach(([key, val]) => {
            if (Array.isArray(val) && val.length) aggregatedErrors[key] = String(val[0]);
            else if (typeof val === 'string') aggregatedErrors[key] = val;
          });
          if ((errorData as any).non_field_errors?.length) {
            aggregatedErrors['non_field_errors'] = (errorData as any).non_field_errors[0];
          }
          if ((errorData as any).detail) {
            aggregatedErrors['detail'] = (errorData as any).detail;
          }
        }
        if (Object.keys(aggregatedErrors).length) {
          setFormErrors(aggregatedErrors);
          const firstKey = Object.keys(aggregatedErrors)[0];
          const el = document.getElementById(firstKey);
          if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Não mostrar toast para erros de validação de campos (já exibidos inline)
        } else {
          // Erros globais: manter toast
          toast({ title: "Erro na inscrição", description: errorMessage, variant: "destructive" });
        }
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

  // Campo de cupom no formulário principal
  // Renderizamos antes do botão "Finalizar Inscrição"

  const handlePaymentMethodSelect = (method: 'card' | 'pix') => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPaymentMethod) return;

    if (selectedPaymentMethod === 'card') {
      try {
        // Criar (ou recriar) sessão de checkout no momento da confirmação, passando o cupom
        const regId = registrationData?.id;
        if (!regId) {
          toast({
            title: "Erro no pagamento",
            description: "Inscrição não encontrada. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        const body: any = { registration_id: regId };
        if (couponCode.trim()) {
          body.coupon_code = couponCode.trim().toUpperCase();
        }

        console.log('DEBUG FRONTEND: Criando sessão com', body);
        const resp = await apiRequest(`/api/payment/create-session/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await resp.json();
        console.log('DEBUG FRONTEND: Resposta create-session', resp.status, data);

        if (resp.ok && data?.success && data?.auto_paid) {
          toast({
            title: "Inscrição confirmada! 🎉",
            description: "Cupom de gratuidade aplicado. Seu pagamento foi confirmado automaticamente.",
          });
          navigate('/pagamento/sucesso', { replace: true, state: { paidVia: 'coupon' } });
          return;
        }

        if (resp.ok && data?.success && data?.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }

        // Fallback: usar URL previamente retornada (sem desconto) se existir
        if (registrationData?.payment?.checkout_url) {
          window.location.href = registrationData.payment.checkout_url;
          return;
        }

        toast({
          title: "Erro no pagamento",
          description: data?.error || "Não foi possível iniciar o checkout.",
          variant: "destructive"
        });
      } catch (error) {
        console.error('Erro ao criar sessão de pagamento:', error);
        // Fallback
        if (registrationData?.payment?.checkout_url) {
          window.location.href = registrationData.payment.checkout_url;
          return;
        }
        toast({
          title: "Erro no pagamento",
          description: "Falha ao iniciar checkout.",
          variant: "destructive"
        });
      }
    } else if (selectedPaymentMethod === 'pix') {
      // Criar PIX QR Code
      try {
        const regId = registrationData?.id;
        if (!regId) {
          toast({
            title: "Erro no pagamento",
            description: "Inscrição não encontrada. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        const body: any = { registration_id: regId };
        if (couponCode.trim()) {
          body.coupon_code = couponCode.trim().toUpperCase();
        }

        console.log('DEBUG FRONTEND PIX: Criando PIX com', body);
        const resp = await apiRequest(`/api/payment/pix/create/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await resp.json();
        console.log('DEBUG FRONTEND PIX: Resposta create-pix', resp.status, data);

        if (resp.ok && data?.success) {
          // Fechar modal de seleção e abrir modal do PIX
          setShowPaymentModal(false);
          setPixData(data);
          setShowPixModal(true);
          setPixStatus('pending');
          
          // Iniciar polling para verificar status
          startPixStatusPolling(data.pix_id);
        } else {
          toast({
            title: "Erro ao criar PIX",
            description: data?.error || "Não foi possível criar o QR Code PIX.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erro ao criar PIX:', error);
        toast({
          title: "Erro no pagamento",
          description: "Falha ao criar PIX.",
          variant: "destructive"
        });
      }
    }
  };

  const startPixStatusPolling = (pixId: string) => {
    // Limpar polling anterior se existir
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Verificar status a cada 3 segundos
    const interval = setInterval(async () => {
      try {
        console.log('DEBUG PIX: Verificando status do PIX', pixId);
        const resp = await apiRequest(`/api/payment/pix/check-status/?pix_id=${pixId}`);
        const data = await resp.json();

        console.log('DEBUG PIX: Status recebido', data);

        if (resp.ok && data?.success) {
          if (data.status === 'PAID') {
            setPixStatus('paid');
            clearInterval(interval);
            setPollingInterval(null);

            // Fechar modal antes de navegar (experiência natural)
            setShowPixModal(false);

            toast({
              title: "Pagamento confirmado! 🎉",
              description: "Seu pagamento foi confirmado com sucesso!",
            });

            // Navegação natural via React Router, indicando origem PIX
            navigate('/pagamento/sucesso', { replace: true, state: { paidVia: 'pix' } });
          }
        } else if (!resp.ok) {
          // Em caso de erro no check, considerar fluxo de erro
          clearInterval(interval);
          setPollingInterval(null);
          setShowPixModal(false);
          toast({
            title: "Pagamento não confirmado",
            description: "Não foi possível verificar o pagamento do PIX.",
            variant: "destructive"
          });
          navigate('/pagamento/cancelado', { replace: true });
        }
      } catch (error) {
        console.error('Erro ao verificar status do PIX:', error);
      }
    }, 3000);

    setPollingInterval(interval);
  };

  const handleClosePixModal = () => {
    // Limpar polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setShowPixModal(false);
    setPixData(null);
    setPixStatus('pending');
  };

  const copyPixCode = () => {
    if (pixData?.br_code) {
      navigator.clipboard.writeText(pixData.br_code);
      toast({
        title: "Código copiado!",
        description: "O código PIX foi copiado para a área de transferência.",
      });
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedPaymentMethod(null);
    setRegistrationData(null);
  };

  const handleCloseFreeModal = () => {
    setShowFreeModal(false);
    navigate('/', { replace: true });
  };

  // Restringe digitacao a apenas numeros (permite teclas de controle)
  const allowOnlyDigitsKeyDown = (e: any) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
    ];
    if (
      allowedKeys.includes(e.key) ||
      // Permitir Ctrl/Cmd + A/C/V/X
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
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

  // Valores para exibição no modal de pagamento
  const getRegistrationPrice = () => {
    if (registrationData) {
      if (typeof registrationData?.payment?.amount === 'number') {
        return registrationData.payment.amount;
      }
      const isKids = registrationData?.course === 'KIDS' || registrationData?.modality === 'INFANTIL';
      return isKids ? 50 : 80;
    }
    const isKidsFallback = formData.modality === 'INFANTIL' || formData.course === 'KIDS';
    return isKidsFallback ? 50 : 80;
  };

  const basePrice = getRegistrationPrice();
  const showDiscount = !registrationData && isCouponValid && couponDiscount > 0;
  const finalPrice = showDiscount ? Math.max(basePrice - couponDiscount, 0) : basePrice;

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
              Inscrições ADMOVING
            </h1>
            <div className="mb-6">
              <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg animate-pulse">
                1º LOTE - Valores Promocionais
              </span>
            </div>
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
                    <span className="text-sm text-muted-foreground">14 de Dezembro, 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Horário:</span>
                    <span className="text-sm text-muted-foreground">06:00h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Local:</span>
                    <span className="text-sm text-muted-foreground">Parque Potycabana</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Modalidades:</span>
                    <span className="text-sm text-muted-foreground">Infantil e Adulto</span>
                  </div>
                  <div className="pt-3">
                    <a
                      href="/REGULAMENTO%20OFICIAL%20%E2%80%93%20ADMoving.pdf"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-race-primary text-race-primary hover:bg-race-primary/10 transition-colors text-xs font-medium"
                    >
                      <Download className="w-4 h-4" /> Baixar Regulamento (PDF)
                    </a>
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
                        {formErrors.full_name && <p className="text-sm text-red-600">{formErrors.full_name}</p>}
                      </div>
                      {formData.course !== 'KIDS' && (
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            value={formatCPF(formData.cpf)}
                            onChange={(e) => handleInputChange("cpf", e.target.value.replace(/\D/g, '').slice(0, 11))}
                            onKeyDown={allowOnlyDigitsKeyDown}
                            inputMode="numeric"
                            placeholder="000.000.000-00"
                            required
                            maxLength={14}
                            className="border-race-primary-light/30 focus:border-race-primary"
                          />
                          {formErrors.cpf && <p className="text-sm text-red-600">{formErrors.cpf}</p>}
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
                          {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                          <Input
                            id="phone"
                            value={formatPhone(formData.phone)}
                            onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, '').slice(0, 11))}
                            onKeyDown={allowOnlyDigitsKeyDown}
                            inputMode="numeric"
                            placeholder="(11) 99999-9999"
                            required
                            maxLength={15}
                            className="border-race-primary-light/30 focus:border-race-primary"
                          />
                          {formErrors.phone && <p className="text-sm text-red-600">{formErrors.phone}</p>}
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
                        {formErrors.birth_date && <p className="text-sm text-red-600">{formErrors.birth_date}</p>}
                    
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
                        {formErrors.gender && <p className="text-sm text-red-600">{formErrors.gender}</p>}
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
                            <SelectItem value="KIDS">Kids(3 a 12 anos)</SelectItem>
                            <SelectItem value="RUN_5K">5KM (Corrida)</SelectItem>
                            <SelectItem value="WALK_3K">2,5KM (Caminhada)</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.course && <p className="text-sm text-red-600">{formErrors.course}</p>}
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
                        {formErrors.shirt_size && <p className="text-sm text-red-600">{formErrors.shirt_size}</p>}
                        <p className="text-xs text-muted-foreground">{formData.course==='KIDS' ? 'Tamanhos infantis 4, 6, 8, 10, 12 anos' : 'Tamanhos adulto: Tradicional PP a XXG'}</p>
                      </div>
                    </div>

                    {formData.course === 'KIDS' && (
                      <div className="space-y-4 p-4 rounded-lg border border-race-primary-light/30 bg-white/70">
                        <h3 className="font-semibold text-race-primary">Dados do Responsável</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="responsible_full_name">Nome do Responsável *</Label>
                          <Input id="responsible_full_name" value={formData.responsible_full_name} onChange={(e)=>handleInputChange('responsible_full_name', e.target.value)} required={formData.course==='KIDS'} />
                          {formErrors.responsible_full_name && <p className="text-sm text-red-600">{formErrors.responsible_full_name}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsible_cpf">CPF do Responsável *</Label>
                            <Input
                              id="responsible_cpf"
                              value={formatCPF(formData.responsible_cpf)}
                              onChange={(e)=>handleInputChange('responsible_cpf', e.target.value.replace(/\D/g,'').slice(0,11))}
                              onKeyDown={allowOnlyDigitsKeyDown}
                              inputMode="numeric"
                              placeholder="000.000.000-00"
                              required={formData.course==='KIDS'}
                            />
                            {formErrors.responsible_cpf && <p className="text-sm text-red-600">{formErrors.responsible_cpf}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsible_email">Email do Responsável *</Label>
                            <Input id="responsible_email" type="email" value={formData.responsible_email} onChange={(e)=>handleInputChange('responsible_email', e.target.value)} required={formData.course==='KIDS'} />
                            {formErrors.responsible_email && <p className="text-sm text-red-600">{formErrors.responsible_email}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsible_phone">Telefone do Responsável *</Label>
                            <Input id="responsible_phone" value={formatPhone(formData.responsible_phone)} onChange={(e)=>handleInputChange('responsible_phone', e.target.value.replace(/\D/g,''))} placeholder="(11) 99999-9999" required={formData.course==='KIDS'} />
                            {formErrors.responsible_phone && <p className="text-sm text-red-600">{formErrors.responsible_phone}</p>}
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

                    {/* Cupom de Desconto (no formulário principal) */}
                    <div className="space-y-2">
                      <Label htmlFor="coupon">Cupom de Desconto (opcional)</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            id="coupon"
                            type="text"
                            placeholder="Digite o código do cupom"
                            value={couponCode}
                            onChange={(e) => handleCouponChange(e.target.value)}
                            className="border-race-primary-light/30 focus:border-race-primary flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyCoupon();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim() || isValidatingCoupon}
                            className="bg-race-primary hover:bg-race-primary/90 px-4"
                          >
                            {isValidatingCoupon ? "..." : "Aplicar"}
                          </Button>
                        </div>
                        {isValidatingCoupon && (
                          <p className="text-sm text-gray-500">Validando cupom...</p>
                        )}
                        {couponMessage && (
                          <p className={`text-sm ${isCouponValid ? 'text-green-600' : 'text-red-600'}`}>
                            {couponMessage}
                          </p>
                        )}
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
      
      <Footer />
      <InstagramFloat />

      {/* Modal de Seleção de Pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-teko">Escolha sua forma de pagamento</DialogTitle>
            <DialogDescription className="text-center">
              Selecione como deseja pagar sua inscrição
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Campo de Cupom de Desconto movido para o formulário principal */}

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-4">Escolha sua forma de pagamento:</p>
            </div>

            {/* Opção Cartão de Crédito */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === 'card' 
                  ? 'border-race-primary bg-race-primary/5' 
                  : 'border-gray-200 hover:border-race-primary/50'
              }`}
              onClick={() => handlePaymentMethodSelect('card')}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  selectedPaymentMethod === 'card' 
                    ? 'bg-race-primary text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Cartão de Crédito</h3>
                  <p className="text-sm text-gray-600">Pague com segurança via Stripe</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedPaymentMethod === 'card' 
                    ? 'border-race-primary bg-race-primary' 
                    : 'border-gray-300'
                }`}>
                  {selectedPaymentMethod === 'card' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Opção PIX */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === 'pix' 
                  ? 'border-race-primary bg-race-primary/5' 
                  : 'border-gray-200 hover:border-race-primary/50'
              }`}
              onClick={() => handlePaymentMethodSelect('pix')}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  selectedPaymentMethod === 'pix' 
                    ? 'bg-race-primary text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">PIX</h3>
                  <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedPaymentMethod === 'pix' 
                    ? 'border-race-primary bg-race-primary' 
                    : 'border-gray-300'
                }`}>
                  {selectedPaymentMethod === 'pix' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Valor */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Valor da inscrição:</span>
                <span>R$ {basePrice.toFixed(2)}</span>
              </div>
              {showDiscount && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto do cupom:</span>
                  <span>- R$ {couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>R$ {finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handlePaymentCancel}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePaymentConfirm}
              disabled={!selectedPaymentMethod}
              className="w-full sm:w-auto bg-race-primary hover:bg-race-primary/90"
            >
              {selectedPaymentMethod === 'card' ? 'Pagar com Cartão' : 'Continuar com PIX'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Pagamento PIX */}
      <Dialog open={showPixModal} onOpenChange={handleClosePixModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-teko">Pagamento via PIX</DialogTitle>
            <DialogDescription className="text-center">
              {pixStatus === 'paid' ? 'Pagamento confirmado!' : 'Escaneie o QR Code ou copie o código para pagar'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {pixStatus === 'paid' ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-green-600">Pagamento Confirmado!</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Seu pagamento foi processado com sucesso. Você será redirecionado em instantes.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* QR Code */}
                {pixData?.br_code_base64 && (
                  <div className="flex justify-center">
                    <img 
                      src={pixData.br_code_base64} 
                      alt="QR Code PIX" 
                      className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  {pixStatus === 'pending' ? (
                    <>
                      <Clock className="h-4 w-4 animate-pulse" />
                      <span>Aguardando pagamento...</span>
                    </>
                  ) : pixStatus === 'checking' ? (
                    <>
                      <div className="h-4 w-4 border-2 border-gray-300 border-t-race-primary rounded-full animate-spin" />
                      <span>Verificando pagamento...</span>
                    </>
                  ) : null}
                </div>

                {/* Código PIX para copiar */}
                {pixData?.br_code && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Código PIX (Copia e Cola)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={pixData.br_code} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        onClick={copyPixCode}
                        className="bg-race-primary hover:bg-race-primary/90"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Valor */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor a pagar:</span>
                    <span className="text-2xl font-bold text-race-primary">
                      R$ {pixData?.amount?.toFixed(2) || '0,00'}
                    </span>
                  </div>
                </div>

                {/* Instruções */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-blue-900 text-sm">Como pagar:</h4>
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Abra o app do seu banco</li>
                    <li>Escolha pagar via PIX</li>
                    <li>Escaneie o QR Code ou cole o código</li>
                    <li>Confirme o pagamento</li>
                  </ol>
                  <p className="text-xs text-blue-700 mt-2">
                    ⏱️ O pagamento será confirmado automaticamente em alguns segundos.
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleClosePixModal}
              className="w-full"
            >
              {pixStatus === 'paid' ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Inscrição Gratuita */}
      <Dialog open={showFreeModal} onOpenChange={setShowFreeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-teko">Inscrição gratuita registrada</DialogTitle>
            <DialogDescription className="text-center">
              Seu cupom de 100% foi aplicado e sua inscrição foi confirmada automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-900 rounded-lg p-4">
              ✅ Você receberá um email de confirmação com os detalhes da inscrição.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseFreeModal} className="w-full">Ok</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inscricoes;