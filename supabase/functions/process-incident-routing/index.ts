import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Incident routing request received');
    
    const { session_id, issue_type, severity, customer_info, package_info } = await req.json();
    const workflow_type = 'package_incident';
    
    console.log('Request data:', { session_id, issue_type, severity, workflow_type });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze incident and determine routing
    const incidentAnalysis = {
      issue_type: issue_type || 'damaged_package',
      severity: severity || 'high',
      classification: 'critical_incident',
      priority: 'immediate_escalation',
      recommended_action: 'transfer_to_specialist',
      analysis_timestamp: new Date().toISOString(),
      routing_decision: {
        action: 'escalate',
        reason: 'Damaged package requires specialized handling',
        department: 'incident_resolution',
        estimated_resolution_time: '15-30 minutes'
      },
      context_for_agent: {
        customer_identified: !!customer_info,
        package_located: !!package_info,
        incident_type: 'Physical damage to package',
        urgency_level: 'High - Customer satisfaction risk',
        required_actions: [
          'Verify damage extent',
          'Process compensation claim',
          'Arrange replacement/refund',
          'Document incident for carrier'
        ]
      }
    };

    const routingData = {
      incident_analysis: incidentAnalysis,
      next_action: 'escalate_to_agent',
      routing_timestamp: new Date().toISOString()
    };

    // Update workflow with incident analysis
    const { error: upsertError } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type,
        current_step: 'intelligent_routing',
        step_data: routingData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (upsertError) {
      console.error('Error updating workflow:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to update workflow' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    console.error('Error in process-incident-routing function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});