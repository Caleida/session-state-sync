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
    const { session_id, phone_number } = await req.json();
    
    if (!session_id || !phone_number) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'session_id and phone_number are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing SMS confirmation for session:', session_id, 'to phone:', phone_number);

    // Find the workflow
    const { data: workflow, error: fetchError } = await supabase
      .from('workflows')
      .select('*')
      .eq('session_id', session_id)
      .eq('workflow_type', 'booking')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching workflow:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error fetching workflow' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!workflow) {
      console.error('Workflow not found for session:', session_id);
      return new Response(
        JSON.stringify({ error: 'Workflow not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate SMS sending (no real SMS)
    const simulatedSMSData = {
      sms_confirmation: {
        sent_to: phone_number,
        sent_at: new Date().toISOString(),
        message: `Su cita ha sido confirmada. SMS enviado a ${phone_number}`,
        status: 'sent',
        delivery_status: 'delivered'
      },
      // Keep existing step data
      ...workflow.step_data
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
      .maybeSingle();

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
