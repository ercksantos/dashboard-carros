import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Car, MessageSquare, TrendingUp, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

interface CarData {
  nome: string;
  visitas: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalCars, setTotalCars] = useState(0);
  const [totalAtendimentos, setTotalAtendimentos] = useState(0);
  const [topCar, setTopCar] = useState("");
  const [chartData, setChartData] = useState<CarData[]>([]);

  useEffect(() => {
    // Verificar autenticação
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    loadDashboardData();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Total de carros disponíveis
      const { count: availableCount } = await supabase
        .from("carros")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponível");

      setTotalCars(availableCount || 0);

      // Total de atendimentos dos últimos 30 dias
      const { data: carsData } = await supabase
        .from("carros")
        .select("atendimentos");

      const totalAtend = carsData?.reduce((sum, car) => sum + (car.atendimentos || 0), 0) || 0;
      setTotalAtendimentos(totalAtend);

      // Carro mais procurado
      const { data: topCarData } = await supabase
        .from("carros")
        .select("nome, visitas")
        .order("visitas", { ascending: false })
        .limit(1)
        .single();

      if (topCarData) {
        setTopCar(topCarData.nome);
      }

      // Dados para o gráfico - Top 5 carros mais visitados
      const { data: topCarsData } = await supabase
        .from("carros")
        .select("nome, visitas")
        .order("visitas", { ascending: false })
        .limit(5);

      if (topCarsData) {
        setChartData(topCarsData);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(195 100% 50%)', 'hsl(180 100% 60%)', 'hsl(195 80% 55%)', 'hsl(180 80% 65%)', 'hsl(195 60% 60%)'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do estoque e atendimentos</p>
          </div>
          <Button 
            onClick={() => navigate("/carros")} 
            className="gradient-primary glow-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Gerenciar Carros
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Carros Disponíveis"
            value={totalCars}
            icon={Car}
            trend="+12% vs mês anterior"
            trendUp={true}
          />
          <MetricCard
            title="Atendimentos (30 dias)"
            value={totalAtendimentos}
            icon={MessageSquare}
            trend="+8% vs mês anterior"
            trendUp={true}
          />
          <MetricCard
            title="Carro Mais Procurado"
            value={topCar || "N/A"}
            icon={TrendingUp}
          />
        </div>

        {/* Chart Section */}
        <Card className="glass-card shadow-card p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Carros Mais Procurados</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="nome" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="visitas" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
    </div>
  );
}