import { Badge } from "@/components/ui/badge";

type Etapa = 'novo' | 'qualificado' | 'test_drive' | 'negociando' | 'vendido' | 'perdido' | string | null;

const ETAPA_STYLES: Record<string, string> = {
    novo: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    qualificado: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    test_drive: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    negociando: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    vendido: 'bg-green-500/15 text-green-400 border-green-500/30',
    perdido: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const ETAPA_LABELS: Record<string, string> = {
    novo: 'Novo',
    qualificado: 'Qualificado',
    test_drive: 'Test Drive',
    negociando: 'Negociando',
    vendido: 'Vendido',
    perdido: 'Perdido',
};

interface EtapaBadgeProps {
    etapa: Etapa;
}

export function EtapaBadge({ etapa }: EtapaBadgeProps) {
    const key = etapa ?? 'novo';
    const style = ETAPA_STYLES[key] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
    const label = ETAPA_LABELS[key] ?? key;

    return (
        <Badge
            variant="outline"
            className={`text-xs font-medium border ${style}`}
        >
            {label}
        </Badge>
    );
}
