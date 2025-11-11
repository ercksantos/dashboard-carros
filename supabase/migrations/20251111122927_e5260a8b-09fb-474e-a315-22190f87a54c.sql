-- Criar tabela de carros
CREATE TABLE public.carros (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  marca TEXT NOT NULL,
  ano INTEGER NOT NULL,
  preco NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponível' CHECK (status IN ('disponível', 'vendido', 'revisão')),
  fotos JSONB DEFAULT '[]'::jsonb,
  fotos_internas JSONB DEFAULT '[]'::jsonb,
  visitas INTEGER NOT NULL DEFAULT 0,
  atendimentos INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhorar performance
CREATE INDEX idx_carros_marca ON public.carros(marca);
CREATE INDEX idx_carros_status ON public.carros(status);
CREATE INDEX idx_carros_atualizado_em ON public.carros(atualizado_em DESC);

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente o campo atualizado_em
CREATE TRIGGER update_carros_updated_at
  BEFORE UPDATE ON public.carros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.carros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir leitura pública mas escrita apenas para usuários autenticados
CREATE POLICY "Qualquer um pode visualizar carros"
  ON public.carros
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir carros"
  ON public.carros
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar carros"
  ON public.carros
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar carros"
  ON public.carros
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Inserir alguns dados de exemplo
INSERT INTO public.carros (nome, marca, ano, preco, status, visitas, atendimentos) VALUES
  ('Onix 1.5 LTZ', 'Chevrolet', 2024, 89990.00, 'disponível', 45, 12),
  ('HB20 Evolution', 'Hyundai', 2023, 82500.00, 'disponível', 38, 9),
  ('Polo 200 TSI', 'Volkswagen', 2024, 95000.00, 'disponível', 52, 15),
  ('Cronos Precision', 'Fiat', 2023, 76990.00, 'disponível', 28, 7),
  ('Nivus Highline', 'Volkswagen', 2024, 112000.00, 'vendido', 67, 18);