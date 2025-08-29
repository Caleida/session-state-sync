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
    const { session_id, customer_id } = await req.json();
    
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

    // Mock billing data with detected issue
    const mockBillingData = {
      current_bill: {
        amount: 85.00,
        currency: "EUR",
        billing_period: "2024-01-01 to 2024-01-31",
        due_date: "2024-02-15",
        issued_date: "2024-01-31"
      },
      previous_bill: {
        amount: 45.00,
        currency: "EUR",
        billing_period: "2023-12-01 to 2023-12-31"
      },
      detected_changes: [
        {
          service: "Cine Total",
          type: "new_subscription",
          amount: 40.00,
          activation_date: "2024-01-05",
          description: "Paquete premium de entretenimiento activado"
        }
      ],
      services: [
        {
          name: "Plan Base",
          amount: 25.00,
          status: "active"
        },
        {
          name: "Internet 300MB",
          amount: 20.00,
          status: "active"
        },
        {
          name: "Cine Total",
          amount: 40.00,
          status: "active",
          activation_date: "2024-01-05"
        }
      ]
    };

    // Create billing analysis data for workflow
    const billingAnalysisData = {
      analyzing_bill: {
        billing_details: mockBillingData,
        analysis_time: new Date().toISOString(),
        increment_detected: true,
        increment_amount: 40.00,
        increment_reason: "Nueva suscripción: Cine Total"
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'customer_support',
        current_step: 'analyzing_bill',
        step_data: billingAnalysisData,
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
        billing_details: mockBillingData,
        explanation: "He detectado que tu última factura se emitió hace un par de días. Veo que el incremento se debe a la suscripción al paquete 'Cine Total' que se activó el pasado 5 de enero."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-billing-details function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});