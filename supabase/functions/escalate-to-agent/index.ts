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
    const { session_id, customer_name, conversation_context, workflow_type } = await req.json();
    const finalWorkflowType = workflow_type || 'customer_support';
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get customer name - either from parameter or from package recipient
    let finalCustomerName = customer_name;
    
    if (!finalCustomerName && finalWorkflowType === 'package_incident') {
      // Try to get customer name from package_info in previous steps
      const { data: workflowData } = await supabase
        .from('workflows')
        .select('step_data')
        .eq('session_id', session_id)
        .eq('workflow_type', finalWorkflowType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (workflowData?.step_data?.package_info?.recipient) {
        finalCustomerName = workflowData.step_data.package_info.recipient;
      }
    }

    if (!finalCustomerName) {
      return new Response(
        JSON.stringify({ error: 'customer_name is required and could not be determined from workflow data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock agent assignment based on workflow type
    let agentData;
    let escalationContext;
    
    if (finalWorkflowType === 'package_incident') {
      agentData = {
        agent_id: "AGENT_LAURA_002",
        agent_name: "Laura Rodríguez",
        department: "Incidencias y Compensaciones",
        specialization: "Paquetes dañados y Compensaciones",
        estimated_wait_time: "1-2 minutos",
        assigned_at: new Date().toISOString()
      };

      escalationContext = {
        customer_info: {
          name: finalCustomerName,
          issue_type: "package_incident",
          specific_concern: "Paquete recibido con daños"
        },
        conversation_summary: {
          issue_identified: "Cliente reporta paquete dañado al recibirlo",
          root_cause: "Daño durante transporte - requiere compensación",
          customer_preference: "Busca solución rápida - reembolso o reenvío",
          resolution_attempted: "Escalación automática por criticidad del caso",
          next_action: "Agente especializado debe procesar compensación"
        },
        agent_notes: [
          "URGENTE: Paquete dañado confirmado - Prioridad alta",
          "Cliente identificado y paquete localizado en sistema",
          "Requiere procesamiento inmediato de compensación",
          "Documentar incidencia para reclamo con transportista",
          "Cliente cooperativo - oportunidad de retención"
        ]
      };
    } else {
      agentData = {
        agent_id: "AGENT_MARIA_001",
        agent_name: "María",
        department: "Facturación y Promociones",
        specialization: "Ofertas y Retención",
        estimated_wait_time: "5-10 segundos",
        assigned_at: new Date().toISOString()
      };

      escalationContext = {
        customer_info: {
          name: finalCustomerName,
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
    }

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
        workflow_type: finalWorkflowType,
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
        agent_greeting: finalWorkflowType === 'package_incident' 
          ? `¡Hola ${finalCustomerName}, soy ${agentData.agent_name} del departamento de Incidencias! He recibido tu caso sobre el paquete dañado. Lamento mucho lo ocurrido. Tengo toda la información aquí y vamos a solucionarlo inmediatamente. ¿Podrías contarme exactamente qué daños observaste en el paquete?`
          : `¡Hola ${finalCustomerName}, soy ${agentData.agent_name}! Gracias por esperar. Mi compañero virtual me acaba de pasar tu caso. Veo que está todo claro: tienes una consulta sobre el cargo del paquete 'Cine Total' y te gustaría conocer si hay alguna promoción disponible antes de darlo de baja, ¿es correcto?`
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