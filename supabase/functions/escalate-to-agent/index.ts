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
    const { session_id, customer_name, conversation_context } = await req.json();
    
    if (!session_id || !customer_name) {
      return new Response(
        JSON.stringify({ error: 'session_id and customer_name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Mock agent assignment
    const agentData = {
      agent_id: "AGENT_MARIA_001",
      agent_name: "María",
      department: "Facturación y Promociones",
      specialization: "Ofertas y Retención",
      estimated_wait_time: "5-10 segundos",
      assigned_at: new Date().toISOString()
    };

    // Create comprehensive context for agent
    const escalationContext = {
      customer_info: {
        name: customer_name,
        issue_type: "billing_inquiry",
        specific_concern: "Cine Total subscription charges"
      },
      conversation_summary: {
        issue_identified: "Customer noticed unexpected charge increase",
        root_cause: "Cine Total subscription activated on January 5th",
        customer_preference: "Wants to explore promotional options before canceling",
        resolution_attempted: "Explained charges, offered cancellation",
        next_action: "Customer requested to speak with agent for promotional offers"
      },
      agent_notes: [
        "Customer is aware of Cine Total subscription causing increase",
        "Open to promotional offers to maintain service at lower cost",
        "Gold customer status - eligible for special promotions",
        "Polite and collaborative customer - retention opportunity"
      ]
    };

    // Create agent connection data for workflow
    const agentConnectionData = {
      agent_connected: {
        agent_details: agentData,
        escalation_context: escalationContext,
        handoff_time: new Date().toISOString(),
        context_transferred: true,
        customer_satisfaction_predicted: "high"
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'customer_support',
        current_step: 'agent_connected',
        step_data: agentConnectionData,
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
        agent_info: agentData,
        escalation_context: escalationContext,
        agent_greeting: `¡Hola ${customer_name}, soy ${agentData.agent_name}! Gracias por esperar. Mi compañero virtual me acaba de pasar tu caso. Veo que está todo claro: tienes una consulta sobre el cargo del paquete 'Cine Total' y te gustaría conocer si hay alguna promoción disponible antes de darlo de baja, ¿es correcto?`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in escalate-to-agent function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});