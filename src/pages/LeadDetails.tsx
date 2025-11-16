import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Lead {
  id: number;
  nome: string | null;
  carro_interesse: string | null;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  resumo: string | null;
  created_at: string;
}

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLead();
  }, []);

  const fetchLead = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setLead(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Lead não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalhes do Lead</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{lead.nome || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Carro de Interesse</p>
            <p className="font-medium">{lead.carro_interesse || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Telefone</p>
            <p className="font-medium">{lead.telefone || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{lead.email || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Observações</p>
            <p className="font-medium whitespace-pre-wrap">
              {lead.observacoes || "Nenhuma observação"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Criado em</p>
            <p className="font-medium">
              {new Date(lead.created_at).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD DO RESUMO */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Resumo do Atendimento</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <p className="whitespace-pre-wrap leading-relaxed">
              {lead.resumo || "Nenhum resumo disponível para este lead."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
