import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Lead {
  id: number;
  nome: string | null;
  carro_interesse: string | null;
  telefone: string | null;
  created_at: string;
  status_financiamento: "pendente" | "aprovado" | "reprovado" | null;
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [searchName, setSearchName] = useState("");
  const [searchCar, setSearchCar] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("id, nome, carro_interesse, telefone, created_at, status_financiamento")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data);
    }

    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase
      .from("leads")
      .update({
        status_financiamento: status,
        financiamento_enviado: false,
      })
      .eq("id", id);

    fetchLeads(); // atualiza instantâneo
  };

  const filteredLeads = leads.filter((lead) => {
    const nameMatch = lead.nome?.toLowerCase().includes(searchName.toLowerCase());
    const carMatch = lead.carro_interesse?.toLowerCase().includes(searchCar.toLowerCase());
    const phoneMatch = lead.telefone?.toLowerCase().includes(searchPhone.toLowerCase());

    return nameMatch && carMatch && phoneMatch;
  });

  const renderStatusBadge = (status: string | null) => {
    if (status === "aprovado")
      return <span className="text-green-500 font-semibold">Aprovado</span>;

    if (status === "reprovado")
      return <span className="text-red-500 font-semibold">Reprovado</span>;

    return <span className="text-zinc-400">Pendente</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 max-w-5xl mx-auto space-y-8">

      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        Voltar para o Dashboard
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Button variant="secondary" onClick={fetchLeads}>Atualizar</Button>
      </div>

      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>

        <CardContent>

          {/* filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Filtrar por nome..." value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            <Input placeholder="Filtrar por carro..." value={searchCar} onChange={(e) => setSearchCar(e.target.value)} />
            <Input placeholder="Filtrar por telefone..." value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} />
          </div>

          <div className="space-y-4">
            {filteredLeads.length === 0 && (
              <p className="text-muted-foreground">Nenhum lead encontrado.</p>
            )}

            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-muted p-4 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{lead.nome || "Sem nome"}</p>
                  <p className="text-sm text-muted-foreground">
                    Interesse: {lead.carro_interesse || "Nenhum"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Telefone: {lead.telefone || "-"}
                  </p>

                  <p className="mt-2 text-sm">
                    Financiamento: {renderStatusBadge(lead.status_financiamento)}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Criado em: {new Date(lead.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(lead.id, "aprovado")}
                    className="border border-emerald-500 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition w-full md:w-auto"
                  >
                    Aprovado
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => updateStatus(lead.id, "reprovado")}
                    className="border border-red-500 text-red-400 bg-red-500/5 hover:bg-red-500/20 transition w-full md:w-auto"
                  >
                    Reprovado
                  </Button>

                  <Button
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="w-full md:w-auto"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
