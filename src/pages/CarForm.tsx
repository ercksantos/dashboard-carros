import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "@/components/cars/ImageUpload";

const carSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  marca: z.string().trim().min(1, "Marca é obrigatória").max(50),
  tipo: z.string().trim().min(1, "Tipo é obrigatório"),
  cambio: z.string().trim().min(1, "Câmbio é obrigatório"),
  ano: z.number().min(1900).max(new Date().getFullYear() + 1),
  preco: z.number().positive("Preço deve ser positivo"),
  status: z.enum(["disponível", "vendido", "revisão"]),
  km: z.number().nonnegative().nullable().optional(),
  combustivel: z.string().optional(),
  cor: z.string().max(40).optional(),
  descricao: z.string().optional(),
  destaque: z.boolean().optional(),
});

export default function CarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState("");
  const [cambio, setCambio] = useState("");
  const [ano, setAno] = useState("");
  const [preco, setPreco] = useState("");
  const [status, setStatus] = useState("disponível");
  const [fotos, setFotos] = useState<string[]>([]);
  const [fotosInternas, setFotosInternas] = useState<string[]>([]);
  // New fields
  const [km, setKm] = useState("");
  const [cor, setCor] = useState("");
  const [combustivel, setCombustivel] = useState("");
  const [descricao, setDescricao] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [opcionais, setOpcionais] = useState<string[]>([]);
  const [opcionalInput, setOpcionalInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    if (isEditing) {
      loadCar();
    }
  }, [navigate, isEditing]);

  const loadCar = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("carros")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (error) throw error;

      setNome(data.nome);
      setMarca(data.marca);
      setTipo(data.tipo || "");
      setCambio(data.cambio || "");
      setAno(data.ano?.toString() || "");
      setPreco(data.preco?.toString() || "");
      setStatus(data.status);
      setFotos(Array.isArray(data.fotos) ? (data.fotos as string[]) : []);
      setFotosInternas(Array.isArray(data.fotos_internas) ? (data.fotos_internas as string[]) : []);
      // New fields
      setKm(data.km?.toString() ?? "");
      setCor(data.cor ?? "");
      setCombustivel(data.combustivel ?? "");
      setDescricao(data.descricao ?? "");
      setDestaque(data.destaque ?? false);
      setOpcionais(Array.isArray(data.opcionais) ? (data.opcionais as string[]) : []);
    } catch (error) {
      toast.error("Erro ao carregar carro");
      navigate("/carros");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const carData = {
      nome: nome.trim(),
      marca: marca.trim(),
      tipo: tipo.trim(),
      cambio: cambio.trim(),
      ano: parseInt(ano),
      preco: parseFloat(preco),
      status,
      fotos,
      fotos_internas: fotosInternas,
      km: km ? parseInt(km) : null,
      cor: cor.trim() || null,
      combustivel: combustivel || null,
      descricao: descricao.trim() || null,
      destaque,
      opcionais: opcionais.length > 0 ? opcionais : null,
    };

    try {
      carSchema.parse(carData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      let savedCarId = id ? parseInt(id) : null;

      if (isEditing) {
        const { error } = await supabase
          .from("carros")
          .update(carData)
          .eq("id", parseInt(id!));

        if (error) throw error;
        savedCarId = parseInt(id!);
        toast.success("Carro atualizado com sucesso");
      } else {
        const { data, error } = await supabase
          .from("carros")
          .insert([carData])
          .select()
          .single();

        if (error) throw error;
        savedCarId = data.id;
        toast.success("Carro adicionado com sucesso");
      }

      // Sincronizar com agente
      if (savedCarId) {
        try {
          const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-agent', {
            body: {
              tipo: "atualizacao_estoque",
              acao: isEditing ? "atualizado" : "criado",
              carro: {
                id: savedCarId,
                nome: nome.trim(),
                status,
                preco: parseFloat(preco),
                marca: marca.trim(),
              }
            }
          });

          if (syncError) {
            console.error('Erro ao sincronizar com agente:', syncError);
          } else if (syncData?.success) {
            toast.success("Dados sincronizados com o agente");
          }
        } catch (syncErr) {
          console.error('Erro na sincronização:', syncErr);
        }
      }

      navigate("/carros");
    } catch (error) {
      toast.error(isEditing ? "Erro ao atualizar carro" : "Erro ao adicionar carro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/carros")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="glass-card shadow-card p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            {isEditing ? "Editar Carro" : "Adicionar Novo Carro"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Carro</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Onix 1.5 LTZ"
                required
                disabled={loading}
              />
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Chevrolet"
                required
                disabled={loading}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo} disabled={loading}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hatch">Hatch</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="picape">Picape</SelectItem>
                  <SelectItem value="eletrico">Elétrico</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                  <SelectItem value="minivan">Minivan</SelectItem>
                  <SelectItem value="esportivo">Esportivo</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Câmbio */}
            <div className="space-y-2">
              <Label htmlFor="cambio">Câmbio</Label>
              <Select value={cambio} onValueChange={setCambio} disabled={loading}>
                <SelectTrigger id="cambio">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatico">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ano + Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  placeholder="Ex: 2024"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="Ex: 89990.00"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={loading}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponível">Disponível</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                  <SelectItem value="revisão">Revisão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* KM + Cor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="km">Quilometragem (km)</Label>
                <Input
                  id="km"
                  type="number"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  placeholder="Ex: 15000"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  placeholder="Ex: Prata"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Combustível */}
            <div className="space-y-2">
              <Label htmlFor="combustivel">Combustível</Label>
              <Select value={combustivel} onValueChange={setCombustivel} disabled={loading}>
                <SelectTrigger id="combustivel">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex">Flex</SelectItem>
                  <SelectItem value="gasolina">Gasolina</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="eletrico">Elétrico</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva os diferenciais do veículo..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Opcionais (tags input) */}
            <div className="space-y-2">
              <Label>Opcionais</Label>
              <div className="flex gap-2">
                <Input
                  value={opcionalInput}
                  onChange={(e) => setOpcionalInput(e.target.value)}
                  placeholder="Ex: Ar-condicionado"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = opcionalInput.trim();
                      if (v && !opcionais.includes(v)) {
                        setOpcionais(prev => [...prev, v]);
                      }
                      setOpcionalInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={loading}
                  onClick={() => {
                    const v = opcionalInput.trim();
                    if (v && !opcionais.includes(v)) {
                      setOpcionais(prev => [...prev, v]);
                    }
                    setOpcionalInput("");
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {opcionais.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {opcionais.map((op) => (
                    <span
                      key={op}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(26,122,255,0.15)', color: '#1a7aff', border: '0.5px solid rgba(26,122,255,0.3)' }}
                    >
                      {op}
                      <button type="button" onClick={() => setOpcionais(prev => prev.filter(o => o !== op))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Destaque */}
            <div className="flex items-center gap-3">
              <Switch
                id="destaque"
                checked={destaque}
                onCheckedChange={setDestaque}
                disabled={loading}
              />
              <Label htmlFor="destaque" className="cursor-pointer">
                Destacar este veículo
              </Label>
            </div>

            {/* Fotos */}
            <Tabs defaultValue="externas" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="externas">Fotos Externas</TabsTrigger>
                <TabsTrigger value="internas">Fotos Internas</TabsTrigger>
              </TabsList>

              <TabsContent value="externas" className="mt-4">
                <ImageUpload
                  label="Fotos Externas do Veículo"
                  images={fotos}
                  onImagesChange={setFotos}
                  maxImages={10}
                />
              </TabsContent>

              <TabsContent value="internas" className="mt-4">
                <ImageUpload
                  label="Fotos Internas do Veículo"
                  images={fotosInternas}
                  onImagesChange={setFotosInternas}
                  maxImages={10}
                />
              </TabsContent>
            </Tabs>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/carros")}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-primary glow-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
