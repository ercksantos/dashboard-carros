import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EtapaBadge } from "./EtapaBadge";
import { ScoreDots } from "./ScoreDots";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { AlertCircle, Calendar } from "lucide-react";

export interface LeadCardData {
    id: number;
    nome: string | null;
    profissao: string | null;
    carro_interesse: string | null;
    score: number | null;
    resumo: string | null;
    etapa: string | null;
    ultima_interacao_ia: string | null;
    status_financiamento: string | null;
    created_at: string;
}

interface LeadCardProps {
    lead: LeadCardData;
    onRefresh: () => void;
    onSchedule?: (lead: LeadCardData) => void;
}

function getInitials(name: string | null): string {
    if (!name) return '?';
    return name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

const FINANCIAMENTO_STYLE: Record<string, string> = {
    aprovado: 'bg-green-500/10 text-green-400 border-green-500/30',
    reprovado: 'bg-red-500/10 text-red-400 border-red-500/30',
    pendente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

export function LeadCard({ lead, onRefresh, onSchedule }: LeadCardProps) {
    const navigate = useNavigate();

    const isUrgent = lead.ultima_interacao_ia
        ? new Date(lead.ultima_interacao_ia) < new Date(Date.now() - 2 * 60 * 60 * 1000)
        : false;

    const updateFinanciamento = async (status: string) => {
        const { error } = await supabase
            .from("leads")
            .update({ status_financiamento: status, financiamento_enviado: false })
            .eq("id", lead.id);

        if (error) {
            toast.error("Erro ao atualizar financiamento");
        } else {
            toast.success(`Financiamento marcado como ${status}`);
            onRefresh();
        }
    };

    const finStyle = FINANCIAMENTO_STYLE[lead.status_financiamento ?? 'pendente'] ?? FINANCIAMENTO_STYLE.pendente;

    return (
        <div
            className="p-4 rounded-xl"
            style={{ background: '#161b27', border: '0.5px solid rgba(255,255,255,0.06)' }}
        >
            {/* Header row */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                    style={{ background: '#1a7aff' }}
                >
                    {getInitials(lead.nome)}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color: '#e8eaf0' }}>
                            {lead.nome ?? 'Sem nome'}
                        </span>
                        {lead.profissao && (
                            <span className="text-xs" style={{ color: '#6b7280' }}>· {lead.profissao}</span>
                        )}
                        <EtapaBadge etapa={lead.etapa} />
                        {isUrgent && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                                <AlertCircle className="w-3 h-3" />
                                Urgente
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={{ color: '#6b7280' }}>
                            {lead.carro_interesse ?? 'Sem interesse definido'}
                        </span>
                        <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${finStyle}`}
                        >
                            {lead.status_financiamento ?? 'pendente'}
                        </span>
                    </div>

                    {/* Resumo IA */}
                    {lead.resumo && (
                        <p className="text-xs mt-2 line-clamp-2" style={{ color: '#6b7280' }}>
                            {lead.resumo}
                        </p>
                    )}
                </div>

                {/* Score + time */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <ScoreDots score={lead.score} />
                    <span className="text-[10px]" style={{ color: '#6b7280' }}>
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    {lead.ultima_interacao_ia && (
                        <span className="text-[10px]" style={{ color: '#6b7280' }} title="Último contato IA">
                            IA: {formatDistanceToNow(new Date(lead.ultima_interacao_ia), { addSuffix: true, locale: ptBR })}
                        </span>
                    )}
                </div>
            </div>

            {/* Action row */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2 border-green-500/40 text-green-400 bg-green-500/5 hover:bg-green-500/15"
                    onClick={() => updateFinanciamento("aprovado")}
                >
                    Aprovado
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2 border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/15"
                    onClick={() => updateFinanciamento("reprovado")}
                >
                    Reprovado
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-2"
                    style={{ color: '#6b7280' }}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                >
                    Ver detalhes
                </Button>
                {onSchedule && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 flex items-center gap-1"
                        style={{ color: '#1a7aff' }}
                        onClick={() => onSchedule(lead)}
                    >
                        <Calendar className="w-3 h-3" />
                        Agendar test drive
                    </Button>
                )}
            </div>
        </div>
    );
}
