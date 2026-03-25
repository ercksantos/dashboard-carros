import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EtapaBadge } from "./EtapaBadge";
import { ScoreDots } from "./ScoreDots";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export interface LeadCardData {
    id: number;
    nome: string | null;
    profissao: string | null;
    telefone: string | null;
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

/** Extract profession from "Nome, profissão, ..." pattern in resumo */
function extractProfissao(resumo: string | null): string | null {
    if (!resumo) return null;
    const parts = resumo.split(',');
    if (parts.length >= 2) {
        const p = parts[1].trim();
        return p.length > 0 && p.length < 60 ? p : null;
    }
    return null;
}

const FIN_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    aprovado: { bg: 'rgba(34,197,94,0.13)', color: '#4ade80', label: 'Financ. aprovado' },
    reprovado: { bg: 'rgba(239,68,68,0.13)', color: '#f87171', label: 'Financ. reprovado' },
    pendente: { bg: 'rgba(255,255,255,0.07)', color: '#6b7280', label: 'Financ. pendente' },
};

export function LeadCard({ lead, onRefresh, onSchedule }: LeadCardProps) {
    const navigate = useNavigate();
    const avatarColor = AVATAR_COLORS[lead.id % AVATAR_COLORS.length];

    const profissao = lead.profissao ?? extractProfissao(lead.resumo);

    const isUrgent = lead.ultima_interacao_ia
        ? new Date(lead.ultima_interacao_ia) < new Date(Date.now() - 2 * 60 * 60 * 1000)
        : false;

    const finKey = lead.status_financiamento ?? 'pendente';
    const fin = FIN_STYLES[finKey] ?? FIN_STYLES.pendente;

    // Border accent: blue for approved financing, amber for no reply
    const borderColor = lead.status_financiamento === 'aprovado'
        ? 'rgba(59,130,246,0.25)'
        : isUrgent
            ? 'rgba(251,191,36,0.25)'
            : 'rgba(255,255,255,0.07)';

    const updateFinanciamento = async (status: string) => {
        const { error } = await supabase
            .from("leads")
            .update({ status_financiamento: status, financiamento_enviado: false })
            .eq("id", lead.id);
        if (error) toast.error("Erro ao atualizar financiamento");
        else { toast.success(`Financiamento marcado como ${status}`); onRefresh(); }
    };

    const dateStr = (() => {
        try {
            const d = new Date(lead.created_at);
            const diffMs = Date.now() - d.getTime();
            if (diffMs < 7 * 24 * 60 * 60 * 1000) {
                return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
            }
            return d.toLocaleDateString('pt-BR');
        } catch { return '—'; }
    })();

    return (
        <div
            className="rounded-[10px] p-3.5 flex items-start gap-3"
            style={{ background: '#161d2e', border: `0.5px solid ${borderColor}` }}
        >
            {/* Avatar */}
            <div
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5"
                style={{ background: avatarColor.bg, color: avatarColor.text }}
            >
                {getInitials(lead.nome)}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
                {/* Row 1: name · profession · etapa · urgency */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
                        {lead.nome ?? 'Sem nome'}
                    </span>
                    {profissao && (
                        <span className="text-xs" style={{ color: '#4b5563' }}>· {profissao}</span>
                    )}
                    <EtapaBadge etapa={lead.etapa} />
                    {isUrgent && (
                        <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
                        >
                            sem resposta
                        </span>
                    )}
                </div>

                {/* Row 2: car · phone */}
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                    {lead.carro_interesse ?? '—'}
                    {lead.telefone ? ` · ${lead.telefone}` : ''}
                </p>

                {/* Row 3: resumo */}
                {lead.resumo && (
                    <p className="text-xs mt-1.5 line-clamp-2" style={{ color: '#4b5563', lineHeight: '1.5' }}>
                        {lead.resumo}
                    </p>
                )}

                {/* Row 4: meta */}
                <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                    <ScoreDots score={lead.score} />
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: fin.bg, color: fin.color }}>
                        {fin.label}
                    </span>
                    <span className="text-[10px]" style={{ color: '#374151' }}>{dateStr}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 flex-shrink-0 ml-1">
                <div className="flex gap-1.5">
                    <button
                        className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                        style={{ border: '0.5px solid #16a34a', color: '#4ade80', background: 'transparent' }}
                        onClick={() => updateFinanciamento('aprovado')}
                    >
                        Aprovado
                    </button>
                    <button
                        className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                        style={{ border: '0.5px solid #b91c1c', color: '#f87171', background: 'transparent' }}
                        onClick={() => updateFinanciamento('reprovado')}
                    >
                        Reprovado
                    </button>
                </div>
                <div className="flex gap-1.5">
                    <button
                        className="text-xs font-medium px-2.5 py-1 rounded-md"
                        style={{ background: '#1d4ed8', color: '#bfdbfe', border: 'none' }}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                        Ver detalhes
                    </button>
                    {onSchedule && (
                        <button
                            className="text-xs px-2.5 py-1 rounded-md"
                            style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: '#6b7280', background: 'transparent' }}
                            onClick={() => onSchedule(lead)}
                        >
                            + Test drive
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
