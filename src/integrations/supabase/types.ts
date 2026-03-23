export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          id: number
          lead_id: number | null
          carro_id: number | null
          tipo: string
          data_hora: string
          status: string
          observacoes: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: number
          lead_id?: number | null
          carro_id?: number | null
          tipo: string
          data_hora: string
          status?: string
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: number
          lead_id?: number | null
          carro_id?: number | null
          tipo?: string
          data_hora?: string
          status?: string
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: [
          { foreignKeyName: "agendamentos_lead_id_fkey"; columns: ["lead_id"]; referencedRelation: "leads"; referencedColumns: ["id"] },
          { foreignKeyName: "agendamentos_carro_id_fkey"; columns: ["carro_id"]; referencedRelation: "carros"; referencedColumns: ["id"] }
        ]
      }
      carros: {
        Row: {
          ano: number
          atendimentos: number
          atualizado_em: string
          cambio: string | null
          combustivel: string | null
          cor: string | null
          criado_em: string
          descricao: string | null
          destaque: boolean | null
          fotos: Json | null
          fotos_internas: Json | null
          id: number
          km: number | null
          marca: string
          nome: string
          opcionais: Json | null
          preco: number
          status: string
          tipo: string | null
          visitas: number
        }
        Insert: {
          ano: number
          atendimentos?: number
          atualizado_em?: string
          cambio?: string | null
          combustivel?: string | null
          cor?: string | null
          criado_em?: string
          descricao?: string | null
          destaque?: boolean | null
          fotos?: Json | null
          fotos_internas?: Json | null
          id?: number
          km?: number | null
          marca: string
          nome: string
          opcionais?: Json | null
          preco: number
          status?: string
          tipo?: string | null
          visitas?: number
        }
        Update: {
          ano?: number
          atendimentos?: number
          atualizado_em?: string
          cambio?: string | null
          combustivel?: string | null
          cor?: string | null
          criado_em?: string
          descricao?: string | null
          destaque?: boolean | null
          fotos?: Json | null
          fotos_internas?: Json | null
          id?: number
          km?: number | null
          marca?: string
          nome?: string
          opcionais?: Json | null
          preco?: number
          status?: string
          tipo?: string | null
          visitas?: number
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          id: number
          nome_concessionaria: string | null
          whatsapp_numero: string | null
          horario_abertura: string | null
          horario_fechamento: string | null
          dias_funcionamento: string[] | null
          mensagem_boas_vindas: string | null
          cor_primaria: string | null
          logo_url: string | null
          cidade: string | null
          estado: string | null
          site_publico_ativo: boolean | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: number
          nome_concessionaria?: string | null
          whatsapp_numero?: string | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          dias_funcionamento?: string[] | null
          mensagem_boas_vindas?: string | null
          cor_primaria?: string | null
          logo_url?: string | null
          cidade?: string | null
          estado?: string | null
          site_publico_ativo?: boolean | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: number
          nome_concessionaria?: string | null
          whatsapp_numero?: string | null
          horario_abertura?: string | null
          horario_fechamento?: string | null
          dias_funcionamento?: string[] | null
          mensagem_boas_vindas?: string | null
          cor_primaria?: string | null
          logo_url?: string | null
          cidade?: string | null
          estado?: string | null
          site_publico_ativo?: boolean | null
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: number
          content: string | null
          metadata: Json | null
          embedding: string | null
        }
        Insert: {
          id?: number
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
        }
        Update: {
          id?: number
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: number
          created_at: string
          updated_at: string | null
          nome: string | null
          telefone: string | null
          email: string | null
          carro_interesse: string | null
          resumo: string | null
          status_atendimento: string | null
          status_financiamento: string | null
          followup_enviado: boolean | null
          financiamento_enviado: boolean | null
          origem: string | null
          messenger_id: string | null
          cpf: string | null
          ultima_interacao_lead: string | null
          ultima_interacao_ia: string | null
          profissao: string | null
          score: number | null
          observacoes: string | null
          etapa: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string | null
          nome?: string | null
          telefone?: string | null
          email?: string | null
          carro_interesse?: string | null
          resumo?: string | null
          status_atendimento?: string | null
          status_financiamento?: string | null
          followup_enviado?: boolean | null
          financiamento_enviado?: boolean | null
          origem?: string | null
          messenger_id?: string | null
          cpf?: string | null
          ultima_interacao_lead?: string | null
          ultima_interacao_ia?: string | null
          profissao?: string | null
          score?: number | null
          observacoes?: string | null
          etapa?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string | null
          nome?: string | null
          telefone?: string | null
          email?: string | null
          carro_interesse?: string | null
          resumo?: string | null
          status_atendimento?: string | null
          status_financiamento?: string | null
          followup_enviado?: boolean | null
          financiamento_enviado?: boolean | null
          origem?: string | null
          messenger_id?: string | null
          cpf?: string | null
          ultima_interacao_lead?: string | null
          ultima_interacao_ia?: string | null
          profissao?: string | null
          score?: number | null
          observacoes?: string | null
          etapa?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: number
          created_at: string
          telefone: string | null
          conteudo: string | null
          direcao: string | null
          tipo: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          telefone?: string | null
          conteudo?: string | null
          direcao?: string | null
          tipo?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          telefone?: string | null
          conteudo?: string | null
          direcao?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
