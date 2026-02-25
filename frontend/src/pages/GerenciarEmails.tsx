import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Search, CheckCircle2, XCircle, RefreshCw, Download, Shirt, Save, Pencil, Send, CheckCheck } from "lucide-react";
import { apiRequest } from "@/config/api";

interface Registration {
  id: number;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string | null;
  course: string;
  course_display: string;
  modality: string;
  modality_display: string;
  shirt_size: string;
  shirt_size_display: string;
  gender: string;
  gender_display: string;
  registration_number: string;
  payment_date: string | null;
  payment_email_sent: boolean;
  created_at: string;
}

interface EditState {
  course: string;
  cpf: string;
  shirt_size: string;
}

const COURSE_OPTIONS = [
  { value: "ALL", label: "Todas as Modalidades" },
  { value: "KIDS", label: "Kids" },
  { value: "WALK_3K", label: "Caminhada 3KM" },
  { value: "RUN_5K", label: "Corrida 5KM" },
  { value: "RUN_10K", label: "Corrida 10KM" },
];

const SHIRT_SIZE_OPTIONS = [
  { value: "ALL", label: "Todos os Tamanhos" },
  { value: "PP", label: "PP" },
  { value: "P", label: "P" },
  { value: "M", label: "M" },
  { value: "G", label: "G" },
  { value: "GG", label: "GG" },
  { value: "XG", label: "XG" },
  { value: "XXG", label: "XXG" },
  { value: "4", label: "4 anos" },
  { value: "6", label: "6 anos" },
  { value: "8", label: "8 anos" },
  { value: "10", label: "10 anos" },
  { value: "12", label: "12 anos" },
];

export default function GerenciarEmails() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [shirtSizeFilter, setShirtSizeFilter] = useState("ALL");
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditState>({ course: "", cpf: "", shirt_size: "" });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastTargetIds, setBroadcastTargetIds] = useState<number[]>([]);
  const [broadcastTargetName, setBroadcastTargetName] = useState("");
  const [broadcastProgress, setBroadcastProgress] = useState<{
    status: string;
    total: number;
    sent_count: number;
    failed_count: number;
    current_name: string;
  } | null>(null);

  const openBroadcastFor = (ids: number[], name?: string) => {
    setBroadcastTargetIds(ids);
    setBroadcastTargetName(name || "");
    setBroadcastSubject("");
    setBroadcastMessage("");
    setBroadcastOpen(true);
  };
  const { toast } = useToast();

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const startEditing = (reg: Registration) => {
    setEditingId(reg.id);
    setEditData({ course: reg.course, cpf: reg.cpf === "N/A" ? "" : reg.cpf, shirt_size: reg.shirt_size });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({ course: "", cpf: "", shirt_size: "" });
  };

  const handleSave = async (registrationId: number) => {
    setSavingId(registrationId);
    try {
      const response = await apiRequest("/api/admin/update-registration/", {
        method: "POST",
        body: JSON.stringify({
          registration_id: registrationId,
          course: editData.course,
          cpf: editData.cpf.replace(/\D/g, ""),
          shirt_size: editData.shirt_size,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Salvo com sucesso!", description: "Os dados da inscrição foram atualizados." });
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === registrationId
              ? {
                ...reg,
                course: data.registration.course,
                course_display: data.registration.course_display,
                modality: data.registration.modality,
                modality_display: data.registration.modality_display,
                cpf: data.registration.cpf,
                shirt_size: data.registration.shirt_size,
                shirt_size_display: data.registration.shirt_size_display,
              }
              : reg
          )
        );
        setEditingId(null);
        setEditData({ course: "", cpf: "", shirt_size: "" });
      } else {
        toast({ title: "Erro ao salvar", description: data.error || "Ocorreu um erro inesperado", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao salvar", description: "Não foi possível conectar ao servidor", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

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

  useEffect(() => {
    let filtered = registrations;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.full_name.toLowerCase().includes(term) ||
          reg.email.toLowerCase().includes(term) ||
          reg.cpf.includes(searchTerm) ||
          reg.registration_number.includes(searchTerm)
      );
    }

    if (courseFilter !== "ALL") {
      filtered = filtered.filter((reg) => reg.course === courseFilter);
    }

    if (shirtSizeFilter !== "ALL") {
      filtered = filtered.filter((reg) => reg.shirt_size === shirtSizeFilter);
    }

    setFilteredRegistrations(filtered);
  }, [searchTerm, courseFilter, shirtSizeFilter, registrations]);

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
          title: "Email enviado com sucesso!",
          description: "O email de confirmação foi reenviado.",
        });

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

  const handleBroadcastEmail = async () => {
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      toast({ title: "Preencha todos os campos", description: "Assunto e mensagem são obrigatórios.", variant: "destructive" });
      return;
    }
    setSendingBroadcast(true);
    setBroadcastProgress(null);

    try {
      const payload: Record<string, unknown> = { subject: broadcastSubject, message: broadcastMessage };
      if (broadcastTargetName) {
        payload.registration_ids = broadcastTargetIds;
      }

      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isDev ? 'http://localhost:8000' : 'https://api.admoving.addirceu.com.br';

      const response = await fetch(`${baseUrl}/api/admin/enviar-notificacao/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.success) {
        toast({ title: "Erro ao disparar emails", description: data.error || "Erro inesperado", variant: "destructive" });
        setSendingBroadcast(false);
        return;
      }

      const taskId = data.task_id;

      // Polling do progresso
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`${baseUrl}/api/admin/status-notificacao/${taskId}/`);
          const statusData = await statusRes.json();

          if (statusData.success) {
            setBroadcastProgress({
              status: statusData.status,
              total: statusData.total,
              sent_count: statusData.sent_count,
              failed_count: statusData.failed_count,
              current_name: statusData.current_name || '',
            });

            if (statusData.status === 'done') {
              clearInterval(poll);
              setSendingBroadcast(false);
              toast({
                title: "Envio concluído!",
                description: `Enviados: ${statusData.sent_count} | Falhas: ${statusData.failed_count}`,
              });
            }
          }
        } catch {
          // Ignora erros de polling, tenta de novo no próximo intervalo
        }
      }, 1500);

    } catch {
      toast({ title: "Erro ao disparar emails", description: "Não foi possível conectar ao servidor", variant: "destructive" });
      setSendingBroadcast(false);
    }
  };

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = [
      "Nome",
      "CPF",
      "Email",
      "Telefone",
      "Data Nascimento",
      "Gênero",
      "Modalidade",
      "Tamanho Camisa",
      "Nº Inscrição",
      "Data Pagamento",
      "Email Enviado",
    ];

    const rows = filteredRegistrations.map((reg) => [
      reg.full_name,
      reg.cpf,
      reg.email,
      reg.phone,
      reg.birth_date
        ? new Date(reg.birth_date).toLocaleDateString("pt-BR")
        : "N/A",
      reg.gender_display || reg.gender,
      reg.course_display,
      reg.shirt_size_display,
      reg.registration_number,
      reg.payment_date
        ? new Date(reg.payment_date).toLocaleDateString("pt-BR")
        : "N/A",
      reg.payment_email_sent ? "Sim" : "Não",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inscricoes_admoving.csv";
    link.click();
    URL.revokeObjectURL(url);
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
                  Lista de inscrições com número de registro - Reenvie emails de confirmação
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => openBroadcastFor(filteredRegistrations.map((r) => r.id))}
                  size="sm"
                  disabled={loading || filteredRegistrations.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Disparar Email em Massa
                </Button>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  disabled={loading || filteredRegistrations.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Planilha
                </Button>
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
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Busca e Filtros */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar por nome, email, CPF ou número de inscrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Filtrar por modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={shirtSizeFilter} onValueChange={setShirtSizeFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Filtrar por tamanho de camisa" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIRT_SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      {searchTerm || courseFilter !== "ALL" || shirtSizeFilter !== "ALL"
                        ? "Nenhuma inscrição encontrada com os filtros aplicados"
                        : "Nenhuma inscrição paga encontrada"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRegistrations.map((reg) => {
                      const isEditing = editingId === reg.id;
                      return (
                        <Card key={reg.id} className={`hover:shadow-md transition-shadow ${isEditing ? 'ring-2 ring-primary/50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg">{reg.full_name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {isEditing ? (
                                        <Select value={editData.course} onValueChange={(val) => setEditData((prev) => ({ ...prev, course: val }))}>
                                          <SelectTrigger className="h-7 w-[180px] text-xs">
                                            <SelectValue placeholder="Modalidade" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {COURSE_OPTIONS.filter((o) => o.value !== "ALL").map((opt) => (
                                              <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Badge variant="outline" className="text-xs">
                                          {reg.course_display}
                                        </Badge>
                                      )}
                                      {isEditing ? (
                                        <Select value={editData.shirt_size} onValueChange={(val) => setEditData((prev) => ({ ...prev, shirt_size: val }))}>
                                          <SelectTrigger className="h-7 w-[140px] text-xs">
                                            <Shirt className="h-3 w-3 mr-1" />
                                            <SelectValue placeholder="Tamanho" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {SHIRT_SIZE_OPTIONS.filter((o) => o.value !== "ALL").map((opt) => (
                                              <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                          <Shirt className="h-3 w-3 mr-1" />
                                          {reg.shirt_size_display}
                                        </Badge>
                                      )}
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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">Email:</span> {reg.email}
                                  </div>
                                  <div>
                                    <span className="font-medium">CPF:</span>{" "}
                                    {isEditing ? (
                                      <Input
                                        value={formatCPF(editData.cpf)}
                                        onChange={(e) => setEditData((prev) => ({ ...prev, cpf: e.target.value }))}
                                        className="inline-block h-7 w-[160px] text-xs"
                                        placeholder="000.000.000-00"
                                      />
                                    ) : (
                                      reg.cpf
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-medium">Telefone:</span> {reg.phone}
                                  </div>
                                  <div>
                                    <span className="font-medium">Data de Nascimento:</span>{" "}
                                    {reg.birth_date
                                      ? new Date(reg.birth_date).toLocaleDateString("pt-BR")
                                      : "N/A"}
                                  </div>
                                  <div>
                                    <span className="font-medium">Nº Inscrição:</span>{" "}
                                    <span className="font-bold text-primary">{reg.registration_number}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Camisa:</span> {reg.shirt_size_display}
                                  </div>
                                </div>
                              </div>

                              <div className="flex-shrink-0 flex flex-col gap-2">
                                {isEditing ? (
                                  <>
                                    <Button
                                      onClick={() => handleSave(reg.id)}
                                      disabled={savingId === reg.id}
                                      size="lg"
                                      className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                                    >
                                      {savingId === reg.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Salvando...
                                        </>
                                      ) : (
                                        <>
                                          <Save className="h-4 w-4 mr-2" />
                                          Salvar
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={cancelEditing}
                                      variant="outline"
                                      size="lg"
                                      className="w-full md:w-auto"
                                    >
                                      Cancelar
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => startEditing(reg)}
                                      variant="outline"
                                      size="lg"
                                      className="w-full md:w-auto"
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
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
                                    <Button
                                      onClick={() => openBroadcastFor([reg.id], reg.full_name)}
                                      variant="outline"
                                      size="lg"
                                      className="w-full md:w-auto border-green-300 text-green-700 hover:bg-green-50"
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Disparar Email
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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

      {/* Modal de Disparo de Email em Massa */}
      <Dialog open={broadcastOpen} onOpenChange={(open) => { if (!sendingBroadcast) setBroadcastOpen(open); }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              {broadcastTargetName ? "Disparar Email Individual" : "Disparar Email em Massa"}
            </DialogTitle>
            <DialogDescription>
              {broadcastTargetName ? (
                <>O email será enviado para <strong>{broadcastTargetName}</strong>.</>
              ) : (
                <>O email será enviado para <strong>{broadcastTargetIds.length}</strong> participante(s) listado(s).</>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Progresso em tempo real */}
          {sendingBroadcast && broadcastProgress ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {broadcastProgress.status === 'done' ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCheck className="h-4 w-4" /> Envio concluído!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {broadcastProgress.sent_count + broadcastProgress.failed_count} de {broadcastProgress.total}
                  </span>
                </div>
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${broadcastProgress.status === 'done' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    style={{ width: `${broadcastProgress.total > 0 ? ((broadcastProgress.sent_count + broadcastProgress.failed_count) / broadcastProgress.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-green-600">✓ Enviados: {broadcastProgress.sent_count}</span>
                  {broadcastProgress.failed_count > 0 && (
                    <span className="text-red-500">✕ Falhas: {broadcastProgress.failed_count}</span>
                  )}
                </div>
              </div>
              {broadcastProgress.current_name && broadcastProgress.status !== 'done' && (
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  Enviando para: <strong>{broadcastProgress.current_name}</strong>
                </div>
              )}
              {broadcastProgress.status === 'done' && (
                <div className="flex justify-end">
                  <Button onClick={() => { setBroadcastOpen(false); setBroadcastProgress(null); setBroadcastSubject(""); setBroadcastMessage(""); }}>
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assunto</label>
                  <Input
                    placeholder="Ex: Informações importantes sobre a corrida"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem</label>
                  <Textarea
                    placeholder="Escreva aqui o conteúdo do email..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={8}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBroadcastOpen(false)} disabled={sendingBroadcast}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleBroadcastEmail}
                  disabled={sendingBroadcast || !broadcastSubject.trim() || !broadcastMessage.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {broadcastTargetName ? `Enviar para ${broadcastTargetName}` : `Enviar para ${broadcastTargetIds.length} participante(s)`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
