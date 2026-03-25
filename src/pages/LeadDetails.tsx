import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EtapaBadge } from "@/components/leads/EtapaBadge";
import { ScoreDots } from "@/components/leads/ScoreDots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Phone, Mail, Car, User, MapPin, Calendar, MessageSquare } from "lucide-react";

interface Lead {
  id: number;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  origem: string | null;
  profissao: string | null;
  carro_interesse: string | null;
  resumo: string | null;
  observacoes: string | null;
  etapa: string | null;
  score: number | null;
  status_financiamento: string | null;
  followup_enviado: boolean | null;
  financiamento_enviado: boolean | null;
  created_at: string;
  ultima_interacao_ia: string | null;
}

interface Message {
  id: number;
  created_at: string;
  conteudo: string | null;
  direcao: string | null;
  tipo: string | null;
}

const AVATAR_COLORS = [
  { bg: 'rgba(59,130,246,0.18)', text: '#60a5fa' },
  { bg: 'rgba(34,197,94,0.16)', text: '#4ade80' },
  { bg: 'rgba(251,191,36,0.16)', text: '#fbbf24' },
  { bg: 'rgba(167,139,250,0.18)', text: '#a78bfa' },
  { bg: 'rgba(251,113,133,0.16)', text: '#fb7185' },
];

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function extractProfissao(resumo: string | null, profissao: string | null): string | null {
  if (profissao) return profissao;
  if (!resumo) return null;
  const parts = resumo.split(',');
  if (parts.length >= 2) {
    const p = parts[1].trim();
    return p.length > 0 && p.length < 60 ? p : null;
  }
  return null;
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [obs, setObs] = useState("");
  const [savingObs, setSavingObs] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleObs, setScheduleObs] = useState("");
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setLead(data);
      setObs(data.observacoes ?? "");
      if (data.telefone) fetchMessages(data.telefone);
    }
    setLoading(false);
  };

  const fetchMessages = async (telefone: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id, created_at, conteudo, direcao, tipo")
      .eq("telefone", telefone)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data);
  };

  const updateEtapa = async (etapa: string) => {
    const { error } = await supabase.from("leads").update({ etapa }).eq("id", id);
    if (error) toast.error("Erro ao atualizar etapa");
    else { toast.success("Etapa atualizada"); setLead(prev => prev ? { ...prev, etapa } : prev); }
  };

  const updateFinanciamento = async (status: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ status_financiamento: status, financiamento_enviado: false })
      .eq("id", id);
    if (error) toast.error("Erro ao atualizar financiamento");
    else { toast.success(`Financiamento marcado como ${status}`); setLead(prev => prev ? { ...prev, status_financiamento: status } : prev); }
  };

  const saveObs = async () => {
    setSavingObs(true);
    const { error } = await supabase.from("leads").update({ observacoes: obs }).eq("id", id);
    setSavingObs(false);
    if (error) toast.error("Erro ao salvar observações");
    else toast.success("Observações salvas!");
  };

  const confirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) { toast.error("Preencha data e hora"); return; }
    setScheduling(true);
    const dataHora = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    const { error } = await supabase.from("agendamentos").insert({
      lead_id: Number(id),
      tipo: "test_drive",
      data_hora: dataHora,
      observacoes: scheduleObs || null,
      status: "agendado",
    });
    setScheduling(false);
    if (error) toast.error("Erro ao agendar");
    else { toast.success("Test drive agendado!"); setScheduleOpen(false); setScheduleDate(""); setScheduleTime(""); setScheduleObs(""); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0f1117' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: '#3b82f6' }} />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#0f1117' }}>
        <p style={{ color: '#6b7280' }}>Lead não encontrado.</p>
        <button
          className="mt-4 text-sm px-4 py-2 rounded-md"
          style={{ background: '#1d4ed8', color: '#bfdbfe' }}
          onClick={() => navigate('/leads')}
        >Voltar</button>
      </div>
    );
  }

  const avatarColor = AVATAR_COLORS[lead.id % AVATAR_COLORS.length];
  const profissao = extractProfissao(lead.resumo, lead.profissao);

  return (
    <div className="p-6 max-w-5xl" style={{ color: '#e2e8f0' }}>

      {/* ── Back / title ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: '#6b7280' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Leads
        </button>
      </div>

      {/* ── Hero card ── */}
      <div
        className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4"
        style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0"
          style={{ background: avatarColor.bg, color: avatarColor.text }}
        >
          {getInitials(lead.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>{lead.nome ?? 'Sem nome'}</h1>
            {profissao && <span className="text-sm" style={{ color: '#4b5563' }}>· {profissao}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <EtapaBadge etapa={lead.etapa} />
            <ScoreDots score={lead.score} />
            {lead.ultima_interacao_ia && (
              <span className="text-xs" style={{ color: '#4b5563' }}>
                IA: {formatDistanceToNow(new Date(lead.ultima_interacao_ia), { addSuffix: true, locale: ptBR })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            className="text-xs px-3 py-1.5 rounded-md"
            style={{ background: '#1d4ed8', color: '#bfdbfe', border: 'none' }}
            onClick={() => setScheduleOpen(true)}
          >
            + Test Drive
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Contact info */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#374151' }}>Contato</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Phone, label: 'Telefone', value: lead.telefone },
                { icon: Mail, label: 'E-mail', value: lead.email },
                { icon: Car, label: 'Carro interesse', value: lead.carro_interesse },
                { icon: User, label: 'CPF', value: lead.cpf },
                { icon: MapPin, label: 'Origem', value: lead.origem },
                { icon: Calendar, label: 'Criado em', value: lead.created_at ? format(new Date(lead.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : null },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#374151' }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: '#374151' }}>{label}</p>
                    <p className="text-sm" style={{ color: value ? '#9ca3af' : '#1f2937' }}>{value ?? '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Etapa selector */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#374151' }}>Etapa do funil</p>
            <Select value={lead.etapa ?? 'novo'} onValueChange={updateEtapa}>
              <SelectTrigger
                className="h-9 text-sm w-full sm:w-60"
                style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['novo', 'qualificado', 'test_drive', 'negociando', 'vendido', 'perdido'].map(e => (
                  <SelectItem key={e} value={e}>{e.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Financing */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#374151' }}>Financiamento</p>
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{
                  background: lead.status_financiamento === 'aprovado' ? 'rgba(34,197,94,0.13)' : lead.status_financiamento === 'reprovado' ? 'rgba(239,68,68,0.13)' : 'rgba(255,255,255,0.07)',
                  color: lead.status_financiamento === 'aprovado' ? '#4ade80' : lead.status_financiamento === 'reprovado' ? '#f87171' : '#6b7280',
                }}
              >
                {lead.status_financiamento === 'aprovado' ? 'Aprovado' : lead.status_financiamento === 'reprovado' ? 'Reprovado' : 'Pendente'}
              </span>
              <button
                className="text-xs font-medium px-3 py-1.5 rounded-md"
                style={{ border: '0.5px solid #16a34a', color: '#4ade80', background: 'transparent' }}
                onClick={() => updateFinanciamento('aprovado')}
              >Aprovado</button>
              <button
                className="text-xs font-medium px-3 py-1.5 rounded-md"
                style={{ border: '0.5px solid #b91c1c', color: '#f87171', background: 'transparent' }}
                onClick={() => updateFinanciamento('reprovado')}
              >Reprovado</button>
            </div>
          </div>

          {/* Observações */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#374151' }}>Observações</p>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={4}
              placeholder="Adicionar observações sobre este lead..."
              className="w-full rounded-lg p-3 text-sm resize-none outline-none"
              style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}
            />
            <div className="flex justify-end mt-2">
              <button
                className="text-xs px-3 py-1.5 rounded-md"
                style={{ background: '#1d4ed8', color: '#bfdbfe', border: 'none', opacity: savingObs ? 0.6 : 1 }}
                onClick={saveObs}
                disabled={savingObs}
              >
                {savingObs ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* Resumo IA */}
          {lead.resumo && (
            <div
              className="rounded-xl p-4"
              style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#374151' }}>Resumo do atendimento (IA)</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#6b7280' }}>{lead.resumo}</p>
            </div>
          )}
        </div>

        {/* ── Right column: messages ── */}
        <div
          className="rounded-xl flex flex-col"
          style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.07)', maxHeight: '680px' }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" style={{ color: '#374151' }} />
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#374151' }}>Mensagens</p>
              {messages.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#1a2035', color: '#4b5563' }}>{messages.length}</span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <MessageSquare className="w-6 h-6 mb-2" style={{ color: '#1f2937' }} />
                <p className="text-xs" style={{ color: '#374151' }}>Sem mensagens</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSaida = msg.direcao === 'saida' || msg.direcao === 'out';
                return (
                  <div key={msg.id} className={`flex ${isSaida ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[80%] rounded-lg px-3 py-2"
                      style={{
                        background: isSaida ? 'rgba(29,78,216,0.18)' : '#1a2035',
                        border: `0.5px solid ${isSaida ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{msg.conteudo}</p>
                      <p className="text-[9px] mt-1 text-right" style={{ color: '#374151' }}>
                        {format(new Date(msg.created_at), "d MMM HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Schedule dialog ── */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent style={{ background: '#161d2e', border: '0.5px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#e2e8f0' }}>Agendar Test Drive</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Lead: <span className="font-medium" style={{ color: '#e2e8f0' }}>{lead.nome}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label style={{ color: '#e2e8f0' }}>Data</Label>
                <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                  style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#e2e8f0' }}>Hora</Label>
                <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                  style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: '#e2e8f0' }}>Observações (opcional)</Label>
              <Input value={scheduleObs} onChange={(e) => setScheduleObs(e.target.value)}
                placeholder="Ex: Trazer CNH..."
                style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleOpen(false)} style={{ color: '#6b7280' }}>Cancelar</Button>
            <Button onClick={confirmSchedule} disabled={scheduling}
              style={{ background: '#1d4ed8', color: '#bfdbfe', border: 'none' }}>
              {scheduling ? 'Agendando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


