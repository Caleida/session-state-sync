import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, service_name, customer_id } = await req.json();
    
    if (!session_id || !service_name || !customer_id) {
      return new Response(
        JSON.stringify({ error: 'session_id, service_name and customer_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Mock promotions data
    const mockPromotions = [
      {
        promotion_id: "PROMO_CINE_50",
        name: "Cine Total - 50% Descuento",
        description: "50% de descuento en Cine Total por 6 meses",
        original_price: 40.00,
        promotional_price: 20.00,
        duration: "6 meses",
        terms: "Válido para clientes Gold. Precio regular después del período promocional.",
        expires: "2024-03-31"
      },
      {
        promotion_id: "PROMO_BUNDLE_ENT",
        name: "Pack Entretenimiento Completo",
        description: "Cine Total + Deportes Premium por solo 50€/mes",
        original_price: 75.00,
        promotional_price: 50.00,
        duration: "12 meses",
        terms: "Incluye todos los canales premium de entretenimiento y deportes",
        expires: "2024-04-30"
      }
    ];

    // Create promotions data for workflow
    const promotionsData = {
      get_promotions: {
        available_promotions: mockPromotions,
        service_requested: service_name,
        customer_eligible: true,
        promotions_time: new Date().toISOString(),
        agent_escalation_recommended: true
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'customer_support',
        current_step: 'escalating_to_agent',
        step_data: promotionsData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        promotions: mockPromotions,
        message: "He encontrado algunas ofertas interesantes para ti. Te paso ahora mismo con un agente especializado en promociones que te podrá explicar todas las opciones disponibles."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-promotions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});