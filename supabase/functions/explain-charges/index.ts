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
    const { session_id, customer_id, billing_details } = await req.json();
    
    if (!session_id || !customer_id) {
      return new Response(
        JSON.stringify({ error: 'session_id and customer_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Detailed explanation of charges with breakdown
    const chargesExplanation = {
      detailed_breakdown: {
        service_changes: [
          {
            service_name: "Cine Total",
            previous_cost: 0.00,
            current_cost: 40.00,
            difference: 40.00,
            activation_date: "2024-01-05",
            explanation: "Nuevo servicio activado - Paquete premium de entretenimiento",
            billing_cycle: "Mensual",
            next_billing: "2024-02-05"
          }
        ],
        monthly_summary: {
          base_services: 45.00,
          new_services: 40.00,
          total_current: 85.00,
          total_previous: 45.00,
          difference: 40.00,
          percentage_increase: 88.89
        },
        explanation_details: {
          reason: "El incremento se debe únicamente a la activación del servicio 'Cine Total' el 5 de enero",
          impact: "Este cambio añade €40 mensuales a tu factura",
          next_steps: [
            "Puedes cancelar el servicio en cualquier momento",
            "La cancelación surtirá efecto el próximo ciclo de facturación",
            "No hay penalizaciones por cancelación anticipada"
          ]
        }
      }
    };

    // Create charges explanation data for workflow
    const chargesExplanationData = {
      explaining_charges: {
        charges_breakdown: chargesExplanation,
        explanation_time: new Date().toISOString(),
        customer_understands: false,
        next_action_suggested: "offer_cancellation"
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'customer_support',
        current_step: 'explaining_charges',
        step_data: chargesExplanationData,
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
        charges_explanation: chargesExplanation,
        message: "Te explico en detalle el incremento de tu factura. El aumento de €40 corresponde exclusivamente al nuevo servicio 'Cine Total' que se activó el 5 de enero. Este es un paquete premium de entretenimiento que añade canales y contenido on-demand a tu plan."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-charges function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});