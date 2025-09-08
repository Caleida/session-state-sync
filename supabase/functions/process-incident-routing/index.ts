import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔍 [INCIDENT-ROUTING] Function invoked with method:', req.method);
  console.log('🔍 [INCIDENT-ROUTING] Request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log('✅ [INCIDENT-ROUTING] Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 [INCIDENT-ROUTING] Processing incident routing request');
    
    // Parse request body with detailed logging
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('✅ [INCIDENT-ROUTING] Request body parsed successfully:', requestBody);
    } catch (parseError) {
      console.error('❌ [INCIDENT-ROUTING] Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session_id, issue_type, severity, customer_info, package_info } = requestBody;
    const workflow_type = 'package_incident';
    
    console.log('📋 [INCIDENT-ROUTING] Extracted data:', { 
      session_id, 
      issue_type, 
      severity, 
      workflow_type,
      has_customer_info: !!customer_info,
      has_package_info: !!package_info
    });

    // Supabase client initialization with detailed logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 [INCIDENT-ROUTING] Environment variables check:', {
      supabaseUrl: supabaseUrl ? `✅ ${supabaseUrl}` : '❌ Missing',
      supabaseKey: supabaseKey ? `✅ Present (length: ${supabaseKey.length})` : '❌ Missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [INCIDENT-ROUTING] Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing environment variables' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔌 [INCIDENT-ROUTING] Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ [INCIDENT-ROUTING] Supabase client created successfully');

    // Analyze incident and determine routing
    const incidentAnalysis = {
      issue_type: issue_type || 'damaged_package',
      severity: severity || 'high',
      classification: 'incidencia_critica',
      priority: 'escalacion_inmediata',
      recommended_action: 'transferir_a_especialista',
      analysis_timestamp: new Date().toISOString(),
      routing_decision: {
        action: 'escalate',
        reason: 'Paquete dañado requiere gestión especializada',
        department: 'resolución_incidencias',
        estimated_resolution_time: '15-30 minutos'
      },
      context_for_agent: {
        customer_identified: !!customer_info,
        package_located: !!package_info,
        incident_type: 'Daño físico al paquete',
        urgency_level: 'Alto - Riesgo de satisfacción del cliente',
        required_actions: [
          'Verificar extensión del daño',
          'Procesar reclamación de compensación',
          'Gestionar reemplazo/reembolso',
          'Documentar incidencia para transportista'
        ]
      }
    };

    console.log('🧠 [INCIDENT-ROUTING] Generated incident analysis:', JSON.stringify(incidentAnalysis, null, 2));

    const routingData = {
      incident_analysis: incidentAnalysis,
      next_action: 'escalate_to_agent',
      routing_timestamp: new Date().toISOString()
    };

    console.log('📦 [INCIDENT-ROUTING] Routing data prepared:', JSON.stringify(routingData, null, 2));

    // Prepare upsert data with detailed logging
    const upsertData = {
      session_id,
      workflow_type,
      current_step: 'intelligent_routing',
      step_data: routingData,
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 [INCIDENT-ROUTING] Attempting database upsert with data:', JSON.stringify(upsertData, null, 2));
    console.log('🔑 [INCIDENT-ROUTING] Upsert options: { onConflict: "session_id,workflow_type" }');

    // Update workflow with incident analysis
    const { data: upsertResult, error: upsertError } = await supabase
      .from('workflows')
      .upsert(upsertData, {
        onConflict: 'session_id,workflow_type'
      });

    console.log('📊 [INCIDENT-ROUTING] Database operation result:', {
      success: !upsertError,
      data: upsertResult,
      error: upsertError
    });

    if (upsertError) {
      console.error('❌ [INCIDENT-ROUTING] Database upsert failed:', {
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
        code: upsertError.code
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update workflow',
          supabase_error: {
            message: upsertError.message,
            code: upsertError.code,
            details: upsertError.details
          }
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [INCIDENT-ROUTING] Workflow updated successfully');

    const response = { 
      success: true,
      next_step: 'intelligent_routing',
      incident_analysis: incidentAnalysis,
      routing_decision: 'escalate_immediately'
    };

    console.log('🎯 [INCIDENT-ROUTING] Sending successful response:', JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true,
        next_step: 'intelligent_routing',
        incident_analysis: incidentAnalysis,
        routing_decision: 'escalate_immediately'
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 [INCIDENT-ROUTING] Unexpected error occurred:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});