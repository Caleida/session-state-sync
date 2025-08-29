import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send delivery SMS request received');
    
    const { session_id, phone_number, workflow_type = 'delivery_change' } = await req.json();
    
    console.log('Processing delivery SMS for session:', session_id, 'to phone:', phone_number);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simulate SMS sending (no real SMS)
    const simulatedSMSData = {
      sms_confirmation: {
        phone_number: phone_number,
        sent_at: new Date().toISOString(),
        message: `Su cambio de entrega ha sido confirmado. SMS enviado a ${phone_number}`,
        status: 'sent',
        delivery_status: 'delivered'
      }
    };

    // Update workflow using upsert pattern like other edge functions
    const { data: workflow, error: upsertError } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type,
        current_step: 'sms_sent',
        step_data: simulatedSMSData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      })
      .select()
      .maybeSingle();

    if (upsertError) {
      console.error('Error updating workflow:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to update workflow' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Delivery SMS workflow updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        next_step: 'sms_sent',
        sms_details: simulatedSMSData.sms_confirmation
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-delivery-sms function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});