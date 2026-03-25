import { useState } from "react";
import { useLeads, LeadFilters } from "@/hooks/useLeads";
import { LeadCard, LeadCardData } from "@/components/leads/LeadCard";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export default function Leads() {
  const [filters, setFilters] = useState<LeadFilters>({ sort: "recentes" });
  const { leads, loading, refetch } = useLeads(filters);

  const [scheduleTarget, setScheduleTarget] = useState<LeadCardData | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleObs, setScheduleObs] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Section 1: approved financing, not closed
  const approvedLeads = leads.filter(
    (l) => l.status_financiamento === "aprovado" && l.etapa !== "vendido" && l.etapa !== "perdido"
  );
  // Section 2: everyone else not closed
  const approvedIds = new Set(approvedLeads.map((l) => l.id));
  const otherLeads = leads.filter(
    (l) => !approvedIds.has(l.id) && l.etapa !== "vendido" && l.etapa !== "perdido"
  );

  const confirmSchedule = async () => {
    if (!scheduleTarget || !scheduleDate || !scheduleTime) {
      toast.error("Preencha data e hora");
      return;
    }
    setScheduling(true);
    const dataHora = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    const { error } = await supabase.from("agendamentos").insert({
      lead_id: scheduleTarget.id,
      tipo: "test_drive",
      data_hora: dataHora,
      observacoes: scheduleObs || null,
      status: "agendado",
    });
    setScheduling(false);
    if (error) {
      toast.error("Erro ao agendar");
    } else {
      toast.success("Test drive agendado!");
      setScheduleTarget(null);
      setScheduleDate("");
      setScheduleTime("");
      setScheduleObs("");
    }
  };

  return (
    <div className="p-6 space-y-0" style={{ color: "#e2e8f0" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-xl font-medium" style={{ color: "#f1f5f9" }}>Leads</h1>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
          style={{ border: "0.5px solid rgba(255,255,255,0.12)", color: "#9ca3af", background: "transparent" }}
        >
          <RefreshCw className="w-3 h-3" />
          Atualizar
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pb-4 items-center">
        <Input
          placeholder="Filtrar por nome..."
          value={filters.search ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="h-9 text-sm"
          style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
        />

        <Select
          value={filters.etapa ?? "all"}
          onValueChange={(v) => setFilters((f) => ({ ...f, etapa: v }))}
        >
          <SelectTrigger
            className="h-9 text-sm"
            style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
          >
            <SelectValue placeholder="Todas as etapas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="qualificado">Qualificado</SelectItem>
            <SelectItem value="test_drive">Test Drive</SelectItem>
            <SelectItem value="negociando">Negociando</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort ?? "recentes"}
          onValueChange={(v) => setFilters((f) => ({ ...f, sort: v as LeadFilters["sort"] }))}
        >
          <SelectTrigger
            className="h-9 text-sm"
            style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="score">Maior score</SelectItem>
            <SelectItem value="sem_resposta">Sem resposta</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-right" style={{ color: "#4b5563" }}>
          {leads.length} lead{leads.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "#3b82f6" }} />
        </div>
      )}

      {/* ── Section 1: Aprovados ── */}
      {!loading && approvedLeads.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider py-3" style={{ color: "#4b5563" }}>
            Atenção urgente — financiamento aprovado
          </p>
          <div className="flex flex-col gap-2">
            {approvedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onRefresh={refetch} onSchedule={setScheduleTarget} />
            ))}
          </div>
        </div>
      )}

      {/* ── Section 2: Todos os leads ── */}
      {!loading && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider py-3" style={{ color: "#4b5563" }}>
            {approvedLeads.length > 0 ? "Todos os leads" : "Leads"}
          </p>
          {otherLeads.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-xl"
              style={{ background: "#161d2e", border: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm" style={{ color: "#4b5563" }}>Nenhum lead encontrado</p>
              <p className="text-xs mt-1" style={{ color: "#374151" }}>Tente ajustar os filtros</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {otherLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onRefresh={refetch} onSchedule={setScheduleTarget} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Schedule dialog ── */}
      <Dialog open={!!scheduleTarget} onOpenChange={(open) => !open && setScheduleTarget(null)}>
        <DialogContent style={{ background: "#161d2e", border: "0.5px solid rgba(255,255,255,0.1)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#e2e8f0" }}>Agendar Test Drive</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Lead: <span className="font-medium" style={{ color: "#e2e8f0" }}>{scheduleTarget?.nome}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label style={{ color: "#e2e8f0" }}>Data</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "#e2e8f0" }}>Hora</Label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "#e2e8f0" }}>Observações (opcional)</Label>
              <Input
                value={scheduleObs}
                onChange={(e) => setScheduleObs(e.target.value)}
                placeholder="Ex: Trazer CNH..."
                style={{ background: "#1a2035", border: "0.5px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleTarget(null)} style={{ color: "#6b7280" }}>
              Cancelar
            </Button>
            <Button
              onClick={confirmSchedule}
              disabled={scheduling}
              style={{ background: "#1d4ed8", color: "#bfdbfe", border: "none" }}
            >
              {scheduling ? "Agendando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



