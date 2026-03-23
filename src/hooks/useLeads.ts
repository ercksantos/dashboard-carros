import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Lead {
    id: number;
    created_at: string;
    updated_at: string | null;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    carro_interesse: string | null;
    resumo: string | null;
    status_atendimento: string | null;
    status_financiamento: string | null;
    followup_enviado: boolean | null;
    financiamento_enviado: boolean | null;
    origem: string | null;
    messenger_id: string | null;
    cpf: string | null;
    ultima_interacao_lead: string | null;
    ultima_interacao_ia: string | null;
    profissao: string | null;
    score: number | null;
    observacoes: string | null;
    etapa: string | null;
}

export interface LeadFilters {
    search?: string;
    etapa?: string;
    financiamento?: string;
    sort?: 'recentes' | 'score' | 'sem_resposta';
}

export function useLeads(filters: LeadFilters = {}) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            let query = supabase.from("leads").select("*");

            if (filters.search) {
                query = query.ilike("nome", `%${filters.search}%`);
            }
            if (filters.etapa && filters.etapa !== "all") {
                query = query.eq("etapa", filters.etapa);
            }
            if (filters.financiamento && filters.financiamento !== "all") {
                query = query.eq("status_financiamento", filters.financiamento);
            }

            if (filters.sort === "score") {
                query = query.order("score", { ascending: false });
            } else if (filters.sort === "sem_resposta") {
                query = query.order("ultima_interacao_ia", { ascending: true });
            } else {
                query = query.order("created_at", { ascending: false });
            }

            const { data, error } = await query;
            if (error) throw error;
            setLeads(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.search, filters.etapa, filters.financiamento, filters.sort]);

    return { leads, loading, refetch: fetchLeads };
}
