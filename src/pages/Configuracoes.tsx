import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save } from "lucide-react";

const DAYS = [
    { key: 'domingo', label: 'Dom' },
    { key: 'segunda', label: 'Seg' },
    { key: 'terça', label: 'Ter' },
    { key: 'quarta', label: 'Qua' },
    { key: 'quinta', label: 'Qui' },
    { key: 'sexta', label: 'Sex' },
    { key: 'sábado', label: 'Sáb' },
];

interface Config {
    id: number;
    nome_concessionaria: string | null;
    whatsapp_numero: string | null;
    horario_abertura: string | null;
    horario_fechamento: string | null;
    dias_funcionamento: string[] | null;
    mensagem_boas_vindas: string | null;
}

export default function ConfiguracoesPage() {
    const [config, setConfig] = useState<Partial<Config>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nome, setNome] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [abertura, setAbertura] = useState("");
    const [fechamento, setFechamento] = useState("");
    const [dias, setDias] = useState<string[]>([]);
    const [boas_vindas, setBoasVindas] = useState("");

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        const { data } = await supabase.from("configuracoes").select("*").limit(1).single();
        if (data) {
            setConfig(data as Config);
            setNome(data.nome_concessionaria ?? "");
            setWhatsapp(data.whatsapp_numero ?? "");
            setAbertura(data.horario_abertura ?? "");
            setFechamento(data.horario_fechamento ?? "");
            setDias(data.dias_funcionamento ?? []);
            setBoasVindas(data.mensagem_boas_vindas ?? "");
        }
        setLoading(false);
    };

    const toggleDay = (day: string) => {
        setDias(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload = {
                nome_concessionaria: nome,
                whatsapp_numero: whatsapp,
                horario_abertura: abertura,
                horario_fechamento: fechamento,
                dias_funcionamento: dias,
                mensagem_boas_vindas: boas_vindas,
            };

            if (config.id) {
                const { error } = await supabase.from("configuracoes").update(payload).eq("id", config.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("configuracoes").insert(payload);
                if (error) throw error;
            }

            toast.success("Configurações salvas com sucesso");
            fetchConfig();
        } catch {
            toast.error("Erro ao salvar configurações");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" style={{ background: '#161b27' }} />)}
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 max-w-2xl" style={{ color: '#e8eaf0' }}>
            <div>
                <h1 className="text-2xl font-bold" style={{ color: '#e8eaf0' }}>Configurações</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Dados da concessionária e do bot</p>
            </div>

            <div
                className="p-6 rounded-xl space-y-5"
                style={{ background: '#161b27', border: '0.5px solid rgba(255,255,255,0.06)' }}
            >
                <div>
                    <Label style={{ color: '#6b7280' }}>Nome da concessionária</Label>
                    <Input
                        className="mt-1"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Ex: AutoCarros Ltda"
                        style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}
                    />
                </div>

                <div>
                    <Label style={{ color: '#6b7280' }}>Número WhatsApp</Label>
                    <Input
                        className="mt-1"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        placeholder="Ex: 5511999999999"
                        style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label style={{ color: '#6b7280' }}>Horário de abertura</Label>
                        <Input
                            type="time"
                            className="mt-1"
                            value={abertura}
                            onChange={e => setAbertura(e.target.value)}
                            style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}
                        />
                    </div>
                    <div>
                        <Label style={{ color: '#6b7280' }}>Horário de fechamento</Label>
                        <Input
                            type="time"
                            className="mt-1"
                            value={fechamento}
                            onChange={e => setFechamento(e.target.value)}
                            style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}
                        />
                    </div>
                </div>

                <div>
                    <Label style={{ color: '#6b7280' }}>Dias de funcionamento</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {DAYS.map(d => (
                            <button
                                key={d.key}
                                onClick={() => toggleDay(d.key)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                    background: dias.includes(d.key) ? '#1a7aff' : '#1a2035',
                                    color: dias.includes(d.key) ? '#fff' : '#6b7280',
                                    border: `0.5px solid ${dias.includes(d.key) ? '#1a7aff' : 'rgba(255,255,255,0.1)'}`,
                                }}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label style={{ color: '#6b7280' }}>Mensagem de boas-vindas do bot</Label>
                    <Textarea
                        className="mt-1 resize-none"
                        rows={4}
                        value={boas_vindas}
                        onChange={e => setBoasVindas(e.target.value)}
                        placeholder="Olá! Bem-vindo à AutoCarros. Como posso ajudar?"
                        style={{ background: '#1a2035', border: '0.5px solid rgba(255,255,255,0.1)', color: '#e8eaf0' }}
                    />
                </div>

                <Button
                    onClick={save}
                    disabled={saving}
                    className="w-full flex items-center gap-2"
                    style={{ background: '#1a7aff', color: '#fff' }}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar configurações'}
                </Button>
            </div>
        </div>
    );
}
