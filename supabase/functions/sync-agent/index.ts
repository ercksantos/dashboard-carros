import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CarPayload {
  tipo: string;
  acao: string;
  carro: {
    id: number;
    nome: string;
    status: string;
    preco: number;
    marca: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('WEBHOOK_AGENT_URL');
    
    if (!webhookUrl) {
      console.error('WEBHOOK_AGENT_URL não configurado');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'URL do webhook não configurada. Configure WEBHOOK_AGENT_URL nas variáveis de ambiente.' 
        }),
        {
          status: 200, // Retorna 200 para não bloquear a operação principal
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const payload: CarPayload = await req.json();

    console.log('Enviando dados para o agente:', payload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Erro na resposta do webhook:', response.status, await response.text());
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Erro ao sincronizar com o agente' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    console.log('Resposta do agente:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sincronizado com sucesso',
        data 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao sincronizar com agente:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});