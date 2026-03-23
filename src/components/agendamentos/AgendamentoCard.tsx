import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { Agendamento } from "@/hooks/useAgendamentos";

interface AgendamentoCardProps {
    agendamento: Agendamento;
    onRefresh: () => void;
}

const TIPO_LABELS: Record<string, string> = {
    test_drive: 'Test Drive',
    visita: 'Visita',
    reuniao: 'Reunião',
};

const TIPO_STYLES: Record<string, string> = {
    test_drive: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    visita: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    reuniao: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const STATUS_STYLES: Record<string, string> = {
    confirmado: 'bg-blue-500/10 text-blue-400',
    realizado: 'bg-green-500/10 text-green-400',
    cancelado: 'bg-red-500/10 text-red-400',
    nao_compareceu: 'bg-zinc-500/10 text-zinc-400',
};

const STATUS_LABELS: Record<string, string> = {
    confirmado: 'Confirmado',
    realizado: 'Realizado',
    cancelado: 'Cancelado',
    nao_compareceu: 'Não compareceu',
};

export function AgendamentoCard({ agendamento, onRefresh }: AgendamentoCardProps) {
    const navigate = useNavigate();

    const updateStatus = async (status: string) => {
        const { error } = await supabase
            .from("agendamentos")
            .update({ status })
            .eq("id", agendamento.id);

        if (error) {
            toast.error("Erro ao atualizar status");
        } else {
            toast.success(`Status atualizado: ${STATUS_LABELS[status]}`);
            onRefresh();
        }
    };

    const isAlreadyDone = ['realizado', 'cancelado', 'nao_compareceu'].includes(agendamento.status);

    return (
        <div
            className="p-4 rounded-xl"
            style={{ background: '#161b27', border: '0.5px solid rgba(255,255,255,0.06)' }}
        >
            <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    {/* Lead + tipo badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm" style={{ color: '#e8eaf0' }}>
                            {agendamento.lead?.nome ?? 'Lead desconhecido'}
                        </span>
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded border ${TIPO_STYLES[agendamento.tipo] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'}`}
                        >
                            {TIPO_LABELS[agendamento.tipo] ?? agendamento.tipo}
                        </span>
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${STATUS_STYLES[agendamento.status] ?? ''}`}
                        >
                            {STATUS_LABELS[agendamento.status] ?? agendamento.status}
                        </span>
                    </div>

                    {/* Carro + data */}
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                        {agendamento.carro ? `${agendamento.carro.marca} ${agendamento.carro.nome}` : 'Carro não informado'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        {format(new Date(agendamento.data_hora), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {agendamento.observacoes && (
                        <p className="text-xs mt-1 italic" style={{ color: '#6b7280' }}>
                            {agendamento.observacoes}
                        </p>
                    )}
                </div>

                {/* Telefone do lead */}
                {agendamento.lead?.telefone && (
                    <span className="text-xs flex-shrink-0" style={{ color: '#6b7280' }}>
                        {agendamento.lead.telefone}
                    </span>
                )}
            </div>

            {/* Action buttons — only shown if not yet finalized */}
            {!isAlreadyDone && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 border-green-500/40 text-green-400 bg-green-500/5 hover:bg-green-500/15"
                        onClick={() => updateStatus("realizado")}
                    >
                        Realizado
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 border-zinc-500/40 text-zinc-400 bg-zinc-500/5 hover:bg-zinc-500/15"
                        onClick={() => updateStatus("nao_compareceu")}
                    >
                        Não compareceu
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/15"
                        onClick={() => updateStatus("cancelado")}
                    >
                        Cancelar
                    </Button>
                </div>
            )}

            {agendamento.lead_id && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 h-7 text-xs px-2"
                    style={{ color: '#6b7280' }}
                    onClick={() => navigate(`/leads/${agendamento.lead_id}`)}
                >
                    Ver lead →
                </Button>
            )}
        </div>
    );
}
