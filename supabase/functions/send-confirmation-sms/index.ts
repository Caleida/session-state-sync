import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

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
    const { session_id } = await req.json();
    
    if (!session_id) {
      console.error('Missing session_id parameter');
      return new Response(
        JSON.stringify({ error: 'session_id is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing SMS confirmation for session:', session_id);

    // Find the workflow
    const { data: workflow, error: fetchError } = await supabase
      .from('workflows')
      .select('*')
      .eq('session_id', session_id)
      .eq('workflow_type', 'booking')
      .single();

    if (fetchError || !workflow) {
      console.error('Workflow not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Workflow not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if workflow is in the correct step
    if (workflow.current_step !== 'appointment_confirmed') {
      console.error('Invalid workflow step. Current:', workflow.current_step, 'Expected: appointment_confirmed');
      return new Response(
        JSON.stringify({ error: 'Workflow must be in appointment_confirmed step' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract appointment data
    const appointmentData = workflow.step_data?.appointment;
    if (!appointmentData) {
      console.error('No appointment data found in workflow');
      return new Response(
        JSON.stringify({ error: 'No appointment data found' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate SMS sending (no real SMS)
    const simulatedSMSData = {
      sms_confirmation: {
        sent_to: appointmentData.client_phone,
        sent_at: new Date().toISOString(),
        message: `Cita confirmada para ${appointmentData.appointment_date} a las ${appointmentData.appointment_time}. Confirmación: #${appointmentData.confirmation_number}`,
        status: 'sent',
        delivery_status: 'delivered'
      },
      // Keep existing appointment data
      appointment: appointmentData
    };

    // Update workflow to sms_confirmation_sent step
    const { data: updatedWorkflow, error: updateError } = await supabase
      .from('workflows')
      .update({
        current_step: 'sms_confirmation_sent',
        step_data: simulatedSMSData,
        updated_at: new Date().toISOString()
      })
      .eq('id', workflow.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating workflow:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update workflow' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SMS confirmation simulated successfully for session:', session_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS confirmation sent successfully',
        sms_details: simulatedSMSData.sms_confirmation
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-confirmation-sms function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
