import { useState } from "react";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { AgendamentoCard } from "@/components/agendamentos/AgendamentoCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLeads } from "@/hooks/useLeads";

export default function AgendamentosPage() {
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTipo, setFilterTipo] = useState("all");
    const { agendamentos, loading, refetch } = useAgendamentos(filterStatus, filterTipo);

    const [newOpen, setNewOpen] = useState(false);
    const [newLeadId, setNewLeadId] = useState("");
    const [newTipo, setNewTipo] = useState("test_drive");
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [newObs, setNewObs] = useState("");
    const [saving, setSaving] = useState(false);

    const { leads } = useLeads();

    const save = async () => {
        if (!newDate || !newTime) {
            toast.error("Data e hora são obrigatórios");
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.from("agendamentos").insert({
                lead_id: newLeadId ? parseInt(newLeadId) : null,
                tipo: newTipo,
                data_hora: `${newDate}T${newTime}:00`,
                status: "confirmado",
                observacoes: newObs || null,
            });
            if (error) throw error;
            toast.success("Agendamento criado");
            setNewOpen(false);
            setNewLeadId(""); setNewDate(""); setNewTime(""); setNewObs("");
            refetch();
        } catch {
            toast.error("Erro ao criar agendamento");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-6" style={{ color: '#e8eaf0' }}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#e8eaf0' }}>Agendamentos</h1>
                    <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Test drives, visitas e reuniões</p>
                </div>
                <Button style={{ background: '#1a7aff', color: '#fff' }} onClick={() => setNewOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo agendamento
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-44" style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="realizado">Realizado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="nao_compareceu">Não compareceu</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterTipo} onValueChange={setFilterTipo}>
                    <SelectTrigger className="w-40" style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}>
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="test_drive">Test Drive</SelectItem>
                        <SelectItem value="visita">Visita</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" style={{ background: '#161b27' }} />
                    ))}
                </div>
            ) : agendamentos.length === 0 ? (
                <p className="text-sm" style={{ color: '#6b7280' }}>Nenhum agendamento encontrado.</p>
            ) : (
                <div className="space-y-3">
                    {agendamentos.map(ag => (
                        <AgendamentoCard key={ag.id} agendamento={ag} onRefresh={refetch} />
                    ))}
                </div>
            )}

            {/* New agendamento modal */}
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogContent style={{ background: '#161b27', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}>
                    <DialogHeader>
                        <DialogTitle style={{ color: '#e8eaf0' }}>Novo Agendamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label style={{ color: '#6b7280' }}>Lead</Label>
                            <select
                                className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
                                style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}
                                value={newLeadId}
                                onChange={e => setNewLeadId(e.target.value)}
                            >
                                <option value="">Sem lead</option>
                                {leads.map(l => (
                                    <option key={l.id} value={l.id}>{l.nome ?? `Lead #${l.id}`}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label style={{ color: '#6b7280' }}>Tipo</Label>
                            <Select value={newTipo} onValueChange={setNewTipo}>
                                <SelectTrigger className="mt-1" style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="test_drive">Test Drive</SelectItem>
                                    <SelectItem value="visita">Visita</SelectItem>
                                    <SelectItem value="reuniao">Reunião</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label style={{ color: '#6b7280' }}>Data</Label>
                            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                                className="mt-1" style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }} />
                        </div>
                        <div>
                            <Label style={{ color: '#6b7280' }}>Hora</Label>
                            <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                                className="mt-1" style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }} />
                        </div>
                        <div>
                            <Label style={{ color: '#6b7280' }}>Observações</Label>
                            <Input value={newObs} onChange={e => setNewObs(e.target.value)}
                                className="mt-1" style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }} />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setNewOpen(false)}>Cancelar</Button>
                            <Button className="flex-1" style={{ background: '#1a7aff' }} onClick={save} disabled={saving}>
                                {saving ? 'Salvando...' : 'Criar'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
