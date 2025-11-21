import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/cars/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Car {
  id: number;
  nome: string;
  marca: string;
  tipo: string;
  cambio: string;
  ano: number;
  preco: number;
  status: string;
  visitas: number;
  atendimentos: number;
  atualizado_em: string;
}

export default function Cars() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMarca, setFilterMarca] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
    });

    loadCars();

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    filterCars();
  }, [cars, searchTerm, filterMarca, filterStatus]);

  const loadCars = async () => {
    try {
      const { data, error } = await supabase
        .from("carros")
        .select("*")
        .order("atualizado_em", { ascending: false });

      if (error) throw error;

      setCars(data || []);
    } catch {
      toast.error("Erro ao carregar carros");
    } finally {
      setLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = [...cars];

    if (searchTerm) {
      filtered = filtered.filter(
        (car) =>
          car.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.marca.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMarca !== "all") {
      filtered = filtered.filter((car) => car.marca === filterMarca);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((car) => car.status === filterStatus);
    }

    setFilteredCars(filtered);
  };

  const handleDelete = async () => {
    if (!carToDelete) return;

    try {
      const { error } = await supabase.from("carros").delete().eq("id", carToDelete);

      if (error) throw error;

      toast.success("Carro deletado com sucesso");
      loadCars();
    } catch {
      toast.error("Erro ao deletar carro");
    } finally {
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    }
  };

  const handleMarkAsSold = async (id: number) => {
    try {
      const { error } = await supabase.from("carros").update({ status: "vendido" }).eq("id", id);

      if (error) throw error;

      toast.success("Carro marcado como vendido");
      loadCars();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const uniqueMarcas = Array.from(new Set(cars.map((car) => car.marca)));

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

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Carros</h1>
            <p className="text-muted-foreground mt-1">Gerencie todo o estoque da concessionária</p>
          </div>
          <Button onClick={() => navigate("/carros/novo")} className="gradient-primary glow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Carro
          </Button>
        </div>

        <Card className="glass-card shadow-card p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterMarca} onValueChange={setFilterMarca}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as marcas</SelectItem>
                {uniqueMarcas.map((marca) => (
                  <SelectItem key={marca} value={marca}>
                    {marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="disponível">Disponível</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
                <SelectItem value="revisão">Revisão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nome</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Câmbio</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Visitas</TableHead>
                  <TableHead className="text-center">Atendimentos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Nenhum carro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCars.map((car) => (
                    <TableRow key={car.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">{car.nome}</TableCell>
                      <TableCell>{car.marca}</TableCell>
                      <TableCell className="capitalize">{car.tipo || "-"}</TableCell>
                      <TableCell className="capitalize">{car.cambio || "-"}</TableCell>
                      <TableCell>{car.ano}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(car.preco)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={car.status} />
                      </TableCell>
                      <TableCell className="text-center">{car.visitas}</TableCell>
                      <TableCell className="text-center">{car.atendimentos}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/carros/editar/${car.id}`)}>
                            <Edit className="w-4 h-4" />
                          </Button>

                          {car.status !== "vendido" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsSold(car.id)}
                              className="text-success"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCarToDelete(car.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este carro? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
