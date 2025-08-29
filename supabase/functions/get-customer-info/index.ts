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
    const { session_id, phone_number } = await req.json();
    
    if (!session_id || !phone_number) {
      return new Response(
        JSON.stringify({ error: 'session_id and phone_number are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Mock customer data based on phone number
    const mockCustomerData = {
      customer_id: "CUST001",
      name: "Carlos González",
      phone: phone_number,
      account_status: "active",
      customer_since: "2020-03-15",
      vip_status: "gold",
      last_payment: "2024-01-15",
      current_plan: "Premium Plus",
      identification_method: "phone_number_match"
    };

    // Create customer identification data for workflow
    const customerIdentificationData = {
      customer_identified: {
        customer_info: mockCustomerData,
        identification_time: new Date().toISOString(),
        identification_success: true,
        crm_integration: "360_view_enabled"
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'customer_support',
        current_step: 'customer_identified',
        step_data: customerIdentificationData,
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
        customer_info: mockCustomerData,
        message: `Hola ${mockCustomerData.name}, bienvenido al soporte de [Empresa]. Veo por tu número que te llamo por tu nombre.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-customer-info function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});