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

    // Mock cancellation process
    const cancellationData = {
      service_cancelled: service_name,
      cancellation_date: new Date().toISOString(),
      effective_date: "2024-02-01",
      refund_amount: 0,
      next_bill_adjustment: -40.00,
      confirmation_number: `CANC-${Date.now()}`,
      status: "confirmed"
    };

    // Create solution offering data for workflow
    const solutionData = {
      offering_solution: {
        cancellation_details: cancellationData,
        solution_type: "service_cancellation",
        savings: 40.00,
        next_bill_amount: 45.00,
        solution_time: new Date().toISOString()
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'customer_support',
        current_step: 'offering_solution',
        step_data: solutionData,
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
        cancellation_details: cancellationData,
        message: `Perfecto. He cancelado tu suscripción a ${service_name}. No se generará ningún cargo en tu próxima factura y volverás a pagar 45€ como antes.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cancel-subscription function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});