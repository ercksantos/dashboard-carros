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
  created_at: string;
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Estados dos filtros
  const [searchName, setSearchName] = useState("");
  const [searchCar, setSearchCar] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    let query = supabase
      .from("leads")
      .select("id, nome, carro_interesse, created_at")
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setLeads(data);
    }

    setLoading(false);
  };

  // 🔎 Filtro local
  const filteredLeads = leads.filter((lead) => {
    const nameMatch = lead.nome
      ?.toLowerCase()
      .includes(searchName.toLowerCase());

    const carMatch = lead.carro_interesse
      ?.toLowerCase()
      .includes(searchCar.toLowerCase());

    return nameMatch && carMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 max-w-5xl mx-auto space-y-8">

      {/* 🔙 Botão Voltar */}
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

          {/* 🔍 Área de Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Filtrar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />

            <Input
              placeholder="Filtrar por carro de interesse..."
              value={searchCar}
              onChange={(e) => setSearchCar(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredLeads.length === 0 && (
              <p className="text-muted-foreground">Nenhum lead encontrado.</p>
            )}

            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between bg-muted p-4 rounded-lg"
              >
                <div>
                  <p className="font-medium">{lead.nome || "Sem nome"}</p>
                  <p className="text-sm text-muted-foreground">
                    Interesse: {lead.carro_interesse || "Nenhum"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Criado em: {new Date(lead.created_at).toLocaleString()}
                  </p>
                </div>

                <Button onClick={() => navigate(`/leads/${lead.id}`)}>
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
