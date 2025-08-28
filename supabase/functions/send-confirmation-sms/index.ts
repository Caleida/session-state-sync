import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendConfirmationSMSRequest {
  session_id: string;
  user_confirmed: boolean;
  workflow_type?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, user_confirmed, workflow_type = 'appointments' }: SendConfirmationSMSRequest = await req.json();

    console.log('Send confirmation SMS request:', { session_id, user_confirmed, workflow_type });

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!user_confirmed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User declined SMS confirmation' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the workflow by session_id and workflow_type
    const { data: workflow, error: fetchError } = await supabase
      .from('workflows')
      .select('*')
      .eq('session_id', session_id)
      .eq('workflow_type', workflow_type)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching workflow:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workflow' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!workflow) {
      return new Response(
        JSON.stringify({ error: 'Workflow not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if appointment is confirmed
    if (workflow.current_step !== 'appointment_confirmed') {
      return new Response(
        JSON.stringify({ 
          error: 'Cannot send SMS confirmation - appointment not confirmed yet',
          current_step: workflow.current_step 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Extract phone number from step_data for logging
    const stepData = workflow.step_data || {};
    const clientPhone = stepData.client_phone || 'No phone provided';
    
    console.log('Simulating SMS send to:', clientPhone);

    // Update workflow to SMS confirmation sent
    const { error: updateError } = await supabase
      .from('workflows')
      .update({
        current_step: 'sms_confirmation_sent',
        step_data: {
          ...stepData,
          sms_confirmation: {
            sent_at: new Date().toISOString(),
            phone_number: clientPhone,
            simulated: true
          }
        }
      })
      .eq('session_id', session_id)
      .eq('workflow_type', workflow_type);

    if (updateError) {
      console.error('Error updating workflow:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update workflow' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('SMS confirmation step updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `SMS confirmation simulated and sent to ${clientPhone}`,
        step_updated: 'sms_confirmation_sent'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-confirmation-sms function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);