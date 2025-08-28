import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

/**
 * Notify Call Started - ElevenLabs Integration
 * 
 * This edge function handles call initiation notifications from ElevenLabs agents
 * and can be used across multiple workflow types (appointments, consultations, support, etc.)
 * 
 * Required Parameters:
 * - session_id: Unique identifier for the session
 * 
 * Optional Parameters:
 * - agent_id: ElevenLabs agent identifier
 * - conversation_id: ElevenLabs conversation identifier
 * - call_metadata: Additional metadata about the call
 */

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
    console.log('Call start notification request received');
    
    const { 
      session_id, 
      agent_id,
      conversation_id,
      call_metadata
    } = await req.json();
    
    if (!session_id) {
      throw new Error('session_id is required');
    }
    
    // Always use 'booking' as workflow_type since this function is only used for booking flow
    const workflow_type = 'booking';
    
    console.log('Request data:', { 
      session_id, 
      agent_id,
      conversation_id,
      workflow_type
    });

    // Initialize Supabase client first for validation
    const supabase = createClient(
      'https://uoskbpqmlvgrwoqosnew.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2ticHFtbHZncndvcW9zbmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDgzMDgsImV4cCI6MjA2ODkyNDMwOH0.iyK012ElyB_SHOczPRbQcUbon0oV6yYqXs6htmuKv2M"
    );

    // Get valid workflow types from database
    const { data: workflowDefinitions, error: workflowError } = await supabase
      .from('workflow_definitions')
      .select('workflow_type');

    if (workflowError) {
      console.error('Error fetching workflow definitions:', workflowError);
      throw new Error('Failed to validate workflow type');
    }

    const validWorkflowTypes = workflowDefinitions?.map(def => def.workflow_type) || [];
    
    if (validWorkflowTypes.length === 0) {
      throw new Error('No workflow types found in database');
    }

    // Validate workflow_type against database types
    if (!validWorkflowTypes.includes(workflow_type)) {
      throw new Error(`Invalid workflow_type: ${workflow_type}. Valid types: ${validWorkflowTypes.join(', ')}`);
    }

    console.log(`Processing call start notification for workflow type: ${workflow_type}`);

    // Create call start data
    const callStartData = {
      started_at: new Date().toISOString(),
      agent_id: agent_id || null,
      conversation_id: conversation_id || null,
      call_metadata: call_metadata || null,
      call_initiated: true
    };

    console.log(`Generated call start data for ${workflow_type}:`, callStartData);

    // Create generic call start details that work for any workflow type
    const stepData = {
      call_initiation: callStartData,
      start_details: {
        message: 'Call started successfully',
        agent_id: agent_id || 'Not specified',
        conversation_id: conversation_id || 'Not specified',
        workflow_type: workflow_type,
        started_at: new Date().toISOString()
      }
    };

    console.log(`Updating workflow ${workflow_type} to call_started status...`);

    // Update workflow status to call_started
    const { error: updateError } = await supabase
      .from('workflows')
      .upsert({
        session_id: session_id,
        workflow_type: workflow_type,
        current_step: 'call_started',
        step_data: stepData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (updateError) {
      console.error(`Error updating ${workflow_type} workflow:`, updateError);
      throw new Error(`Failed to update ${workflow_type} workflow to call_started state`);
    }

    console.log(`Workflow ${workflow_type} updated successfully to call_started for session ${session_id}`);

    // Return generic response that works for any workflow type
    const response = {
      success: true,
      message: 'Call started and recorded successfully',
      session_id,
      workflow_type,
      agent_id: agent_id || 'Not specified',
      conversation_id: conversation_id || 'Not specified',
      next_step: 'call_started',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in start-call function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error processing call start notification'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});