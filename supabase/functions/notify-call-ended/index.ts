import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

/**
 * Notify Call Ended - ElevenLabs Integration
 * 
 * This edge function handles call termination notifications from ElevenLabs agents
 * and can be used across multiple workflow types (appointments, consultations, support, etc.)
 * 
 * Required Parameters:
 * - session_id: Unique identifier for the session
 * - email: User's email address 
 * - workflow_type: Type of workflow ('appointments', 'consultations', 'support', 'sales', 'general')
 * 
 * Optional Parameters:
 * - call_duration: Duration of the call (string/number)
 * - termination_reason: Reason for call ending (defaults to 'conversation_completed')
 * - call_summary: Summary of the call content
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
    console.log('End call notification request received');
    
    const { 
      session_id, 
      email, 
      call_duration, 
      termination_reason,
      call_summary,
      workflow_type
    } = await req.json();
    
    console.log('Request data:', { 
      session_id, 
      email, 
      call_duration, 
      termination_reason,
      workflow_type
    });

    // Validate required fields
    if (!session_id || !email || !workflow_type) {
      throw new Error('session_id, email, and workflow_type are required parameters');
    }

    // Validate workflow_type against known types
    const validWorkflowTypes = ['appointments', 'consultations', 'support', 'sales', 'general'];
    if (!validWorkflowTypes.includes(workflow_type)) {
      throw new Error(`Invalid workflow_type: ${workflow_type}. Valid types: ${validWorkflowTypes.join(', ')}`);
    }

    console.log(`Processing call end notification for workflow type: ${workflow_type}`);

    // Initialize Supabase client
    const supabase = createClient(
      'https://uoskbpqmlvgrwoqosnew.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2ticHFtbHZncndvcW9zbmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDgzMDgsImV4cCI6MjA2ODkyNDMwOH0.iyK012ElyB_SHOczPRbQcUbon0oV6yYqXs6htmuKv2M'
    );

    // Create call termination data
    const callEndData = {
      call_duration: call_duration || null,
      termination_reason: termination_reason || 'conversation_completed',
      call_summary: call_summary || null,
      ended_at: new Date().toISOString(),
      completed_successfully: true
    };

    console.log(`Generated call end data for ${workflow_type}:`, callEndData);

    // Create generic completion details that work for any workflow type
    const stepData = {
      call_termination: callEndData,
      completion_details: {
        message: 'Call completed successfully',
        duration: call_duration || 'Not specified',
        reason: termination_reason || 'Conversation completed',
        workflow_type: workflow_type,
        ended_at: new Date().toISOString()
      }
    };

    console.log(`Updating workflow ${workflow_type} to call_ended status...`);

    // Update workflow status to call_ended (workflow_type is now guaranteed to be present)
    const { error: updateError } = await supabase
      .from('workflows')
      .upsert({
        session_id: session_id,
        email: email,
        workflow_type: workflow_type, // No fallback needed since it's validated above
        current_step: 'call_ended',
        step_data: stepData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,email,workflow_type'
      });

    if (updateError) {
      console.error(`Error updating ${workflow_type} workflow:`, updateError);
      throw new Error(`Failed to update ${workflow_type} workflow to call_ended state`);
    }

    console.log(`Workflow ${workflow_type} updated successfully to call_ended for session ${session_id}`);

    // Return generic response that works for any workflow type
    const response = {
      success: true,
      message: 'Call completed and recorded successfully',
      session_id,
      workflow_type,
      call_duration: call_duration || 'Not specified',
      termination_reason: termination_reason || 'Conversation completed',
      next_step: 'call_ended',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in end-call function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error completing call notification'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});