import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLeadMetrics() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [pendentes, setPendentes] = useState(0);
  const [finalizados, setFinalizados] = useState(0);

  const load = async () => {
    const { count: total } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    const { count: pend } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status_atendimento", "pendente");

    const { count: fin } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status_atendimento", "finalizado");

    setTotalLeads(total || 0);
    setPendentes(pend || 0);
    setFinalizados(fin || 0);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("realtime-leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { totalLeads, pendentes, finalizados };
}
