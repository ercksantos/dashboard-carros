import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { ScoreDots } from "@/components/leads/ScoreDots";
import { EtapaBadge } from "@/components/leads/EtapaBadge";
import { Button } from "@/components/ui/button";
import { Car, Users, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentLead {
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

interface EtapaCount {
  etapa: string;
  count: number;
}

interface TopCar {
  nome: string;
  count: number;
}

const AVATAR_COLORS = ["#1a7aff", "#7c3aed", "#d97706", "#059669", "#dc2626", "#0891b2"];

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.trim().split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    carrosDisponiveis,
    leadsAtivos,
    leadsSemResposta,
    testDrivesSemana,
    loading: metricsLoading,
  } = useDashboardMetrics();

  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [funnelData, setFunnelData] = useState<EtapaCount[]>([]);
  const [topCars, setTopCars] = useState<TopCar[]>([]);
  const [carrosVendidosMes, setCarrosVendidosMes] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
    });
    loadChartData();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadChartData = async () => {
    // 5 most recent leads
    const { data: recentes } = await supabase
      .from("leads")
      .select("id, nome, profissao, carro_interesse, score, resumo, etapa, ultima_interacao_ia, status_financiamento, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentLeads(recentes ?? []);

    // Funnel counts per etapa
    const etapas = ["novo", "qualificado", "test_drive", "negociando", "vendido"];
    const counts: EtapaCount[] = [];
    for (const etapa of etapas) {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("etapa", etapa);
      counts.push({ etapa, count: count ?? 0 });
    }
    setFunnelData(counts);

    // Top 5 cars by visitas
    const { data: carsData } = await supabase
      .from("carros")
      .select("nome, visitas")
      .order("visitas", { ascending: false })
      .limit(5);
    setTopCars((carsData ?? []).map((c) => ({ nome: c.nome, count: Number(c.visitas) || 0 })));

    // Cars sold this month
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const { count: vendidos } = await supabase
      .from("carros")
      .select("*", { count: "exact", head: true })
      .eq("status", "vendido")
      .gte("updated_at", inicioMes.toISOString());
    setCarrosVendidosMes(vendidos ?? 0);
  };

  const hoje = format(new Date(), "d 'de' MMMM", { locale: ptBR });
  const funnelTotal = Math.max(funnelData.find((f) => f.etapa === "novo")?.count ?? 1, 1);
  const maxCar = Math.max(...topCars.map((c) => c.count), 1);

  const FUNNEL_CONFIG: Record<string, { label: string; color: string }> = {
    novo: { label: "Leads", color: "#1a7aff" },
    qualificado: { label: "Qualificados", color: "#5ba3ff" },
    test_drive: { label: "Test drive", color: "#34c77a" },
    negociando: { label: "Negociando", color: "#f5a623" },
    vendido: { label: "Vendas", color: "#1d9e75" },
  };

  return (
    <div className="p-6 space-y-6" style={{ color: "#e8eaf0" }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#e8eaf0" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "#5a6a80" }}>
            Visão geral — hoje, {hoje}
          </p>
        </div>
      </div>

      {/* ── Metric cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Carros disponíveis */}
        <div className="rounded-xl p-5 space-y-2" style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm" style={{ color: "#6b7280" }}>Carros disponíveis</p>
          <p className="text-3xl font-semibold">{metricsLoading ? "—" : carrosDisponiveis}</p>
          <p className="text-sm" style={{ color: "#34c77a" }}>{carrosVendidosMes} vendidos este mês</p>
        </div>

        {/* Leads ativos */}
        <div className="rounded-xl p-5 space-y-2" style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm" style={{ color: "#6b7280" }}>Leads ativos</p>
          <p className="text-3xl font-semibold">{metricsLoading ? "—" : leadsAtivos}</p>
          <p className="text-sm" style={{ color: leadsSemResposta > 0 ? "#f5a623" : "#34c77a" }}>
            {leadsSemResposta > 0 ? `${leadsSemResposta} sem resposta >2h` : "Todos respondidos"}
          </p>
        </div>

        {/* Atendimentos IA */}
        <div className="rounded-xl p-5 space-y-2" style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm" style={{ color: "#6b7280" }}>Atendimentos IA</p>
          <p className="text-3xl font-semibold">{metricsLoading ? "—" : leadsAtivos}</p>
          <p className="text-sm" style={{ color: "#34c77a" }}>+8% vs mês anterior</p>
        </div>

        {/* Test drives */}
        <div className="rounded-xl p-5 space-y-2" style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm" style={{ color: "#6b7280" }}>Test drives agend.</p>
          <p className="text-3xl font-semibold">{metricsLoading ? "—" : testDrivesSemana}</p>
          <p className="text-sm" style={{ color: "#34c77a" }}>Esta semana</p>
        </div>
      </div>

      {/* ── Main content grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* ── Leads recentes ──────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#161b27", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
            <span className="text-base font-semibold" style={{ color: "#d8e0ec" }}>Leads recentes</span>
            <button onClick={() => navigate("/leads")} className="text-sm hover:underline" style={{ color: "#1a7aff" }}>
              ver todos
            </button>
          </div>

          {recentLeads.length === 0 && (
            <p className="text-sm text-center py-10" style={{ color: "#5a6a80" }}>Nenhum lead cadastrado ainda.</p>
          )}

          {recentLeads.map((lead) => {
            const isUrgent = lead.ultima_interacao_ia
              ? new Date(lead.ultima_interacao_ia) < new Date(Date.now() - 2 * 60 * 60 * 1000)
              : false;
            const hasMaxScore = (lead.score ?? 0) >= 5;

            return (
              <div
                key={lead.id}
                className="flex items-start gap-3.5 px-5 py-3.5 cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                {/* Avatar + urgency dot */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ background: getAvatarColor(lead.id) + "30", color: getAvatarColor(lead.id) }}
                  >
                    {getInitials(lead.nome)}
                  </div>
                  {isUrgent && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: "#f5a623", borderColor: "#161b27" }}
                      title="Sem resposta" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: "#d8e0ec" }}>
                      {lead.nome ?? "Sem nome"}
                    </span>
                    <ScoreDots score={lead.score} />
                  </div>
                  <p className="text-sm mt-0.5 truncate" style={{ color: "#6b7280" }}>
                    {lead.carro_interesse ?? "—"}{lead.profissao ? ` · ${lead.profissao}` : ""}
                  </p>
                  {lead.resumo && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: "#4e5f78", lineHeight: "1.5" }}>
                      {lead.resumo}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {isUrgent && lead.ultima_interacao_ia && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(245,166,35,0.14)", color: "#f5a623" }}>
                        {formatDistanceToNow(new Date(lead.ultima_interacao_ia), { addSuffix: false, locale: ptBR })} sem resposta
                      </span>
                    )}
                    {hasMaxScore && !isUrgent && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(52,199,122,0.14)", color: "#34c77a" }}>
                        Score máximo
                      </span>
                    )}
                    {lead.etapa === "test_drive" && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(26,122,255,0.14)", color: "#5ba3ff" }}>
                        Test drive agend.
                      </span>
                    )}
                    {lead.etapa && lead.etapa !== "test_drive" && !hasMaxScore && !isUrgent && (
                      <EtapaBadge etapa={lead.etapa} />
                    )}
                    {lead.status_financiamento === "pendente" && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)", color: "#6b7280" }}>
                        Financ. pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Funil de vendas */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#161b27", border: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
              <span className="text-base font-semibold" style={{ color: "#d8e0ec" }}>Funil de vendas</span>
              <button onClick={() => navigate("/leads")} className="text-sm hover:underline" style={{ color: "#1a7aff" }}>
                detalhes
              </button>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {funnelData.map((item) => {
                const pct = Math.round((item.count / funnelTotal) * 100);
                const cfg = FUNNEL_CONFIG[item.etapa];
                if (!cfg) return null;
                return (
                  <div key={item.etapa} className="flex items-center gap-3">
                    <span className="text-sm w-24 flex-shrink-0" style={{ color: "#6b7280" }}>{cfg.label}</span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="h-[26px] rounded flex items-center pl-3"
                        style={{ width: `${Math.max(pct, 8)}%`, background: cfg.color, minWidth: item.count > 0 ? "40px" : "0" }}
                      >
                        {item.count > 0 && (
                          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm w-10 text-right flex-shrink-0" style={{ color: "#6b7280" }}>{pct}%</span>
                  </div>
                );
              })}
              {funnelData.length === 0 && (
                <p className="text-sm text-center py-3" style={{ color: "#5a6a80" }}>Sem dados</p>
              )}
            </div>
          </div>

          {/* Carros mais procurados */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#161b27", border: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
              <span className="text-base font-semibold" style={{ color: "#d8e0ec" }}>Carros mais procurados</span>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {topCars.map((car, i) => {
                const barColors = ["#1a7aff", "#5ba3ff", "#7ab8f5", "#7ab8f5", "#9ecfff"];
                return (
                  <div key={car.nome} className="flex items-center gap-3">
                    <span className="text-sm w-28 flex-shrink-0 truncate" style={{ color: "#6b7280" }}>{car.nome}</span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(car.count / maxCar) * 100}%`, background: barColors[i] ?? "#1a7aff" }}
                      />
                    </div>
                    <span className="text-sm w-5 text-right flex-shrink-0" style={{ color: "#6b7280" }}>{car.count}</span>
                  </div>
                );
              })}
              {topCars.length === 0 && (
                <p className="text-sm text-center py-3" style={{ color: "#5a6a80" }}>Sem dados</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
