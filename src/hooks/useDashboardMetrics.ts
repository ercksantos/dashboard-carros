import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardMetrics {
    carrosDisponiveis: number;
    leadsAtivos: number;
    leadsSemResposta: number;
    testDrivesSemana: number;
    loading: boolean;
}

export function useDashboardMetrics(): DashboardMetrics {
    const [carrosDisponiveis, setCarrosDisponiveis] = useState(0);
    const [leadsAtivos, setLeadsAtivos] = useState(0);
    const [leadsSemResposta, setLeadsSemResposta] = useState(0);
    const [testDrivesSemana, setTestDrivesSemana] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            // Carros disponíveis
            const { count: disponiveisCount } = await supabase
                .from("carros")
                .select("*", { count: "exact", head: true })
                .eq("status", "disponível");

            // Leads ativos (etapa não é vendido nem perdido)
            const { count: ativosCount } = await supabase
                .from("leads")
                .select("*", { count: "exact", head: true })
                .not("etapa", "in", '("vendido","perdido")');

            // Leads sem resposta IA há mais de 2 horas
            const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            const { count: semRespostaCount } = await supabase
                .from("leads")
                .select("*", { count: "exact", head: true })
                .lt("ultima_interacao_ia", duasHorasAtras)
                .not("etapa", "in", '("vendido","perdido")');

            // Test drives esta semana
            const agora = new Date();
            const diaDaSemana = agora.getDay(); // 0=dom
            const inicioSemana = new Date(agora);
            inicioSemana.setDate(agora.getDate() - diaDaSemana);
            inicioSemana.setHours(0, 0, 0, 0);

            const fimSemana = new Date(inicioSemana);
            fimSemana.setDate(inicioSemana.getDate() + 7);

            const { count: testDrivesCount } = await supabase
                .from("agendamentos")
                .select("*", { count: "exact", head: true })
                .eq("tipo", "test_drive")
                .gte("data_hora", inicioSemana.toISOString())
                .lt("data_hora", fimSemana.toISOString());

            setCarrosDisponiveis(disponiveisCount ?? 0);
            setLeadsAtivos(ativosCount ?? 0);
            setLeadsSemResposta(semRespostaCount ?? 0);
            setTestDrivesSemana(testDrivesCount ?? 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();

        // Realtime subscription para atualizar métricas automaticamente
        const channel = supabase
            .channel("dashboard-metrics")
            .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, load)
            .on("postgres_changes", { event: "*", schema: "public", table: "carros" }, load)
            .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, load)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return { carrosDisponiveis, leadsAtivos, leadsSemResposta, testDrivesSemana, loading };
}
