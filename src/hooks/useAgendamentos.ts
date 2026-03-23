import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Agendamento {
    id: number;
    lead_id: number | null;
    carro_id: number | null;
    tipo: string;
    data_hora: string;
    status: string;
    observacoes: string | null;
    criado_em: string;
    atualizado_em: string;
    // Joined
    lead?: { nome: string | null; telefone: string | null } | null;
    carro?: { nome: string; marca: string } | null;
}

export function useAgendamentos(filterStatus?: string, filterTipo?: string) {
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAgendamentos = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("agendamentos")
                .select(`
          *,
          lead:leads(nome, telefone),
          carro:carros(nome, marca)
        `)
                .order("data_hora", { ascending: true });

            if (filterStatus && filterStatus !== "all") {
                query = query.eq("status", filterStatus);
            }
            if (filterTipo && filterTipo !== "all") {
                query = query.eq("tipo", filterTipo);
            }

            const { data, error } = await query;
            if (error) throw error;
            setAgendamentos((data as Agendamento[]) ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgendamentos();

        const channel = supabase
            .channel("agendamentos-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, fetchAgendamentos)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterTipo]);

    return { agendamentos, loading, refetch: fetchAgendamentos };
}
