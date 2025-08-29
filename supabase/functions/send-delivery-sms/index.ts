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
    
    const { 
      session_id, 
      phone_number,
      workflow_type = 'delivery_change' 
    } = await req.json();
    
    console.log('Request data:', { session_id, phone_number, workflow_type });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simulate SMS sending
    const simulatedSMSData = {
      sms_confirmation: {
        phone_number: phone_number || "+34 612 345 678",
        message: "Tu entrega ha sido reagendada exitosamente. Nuevo horario: 31/08/2025 entre 09:00-14:00. Confirmación: DLC123456. Gracias por usar nuestro servicio.",
        sent_at: new Date().toISOString(),
        status: "delivered",
        sms_id: `SMS${Math.floor(Math.random() * 1000000)}`
      },
      delivery_updated: true,
      notification_sent: true
    };

    console.log('Generated SMS data:', simulatedSMSData);

    // Update workflow to sms_sent step
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

    console.log('Workflow updated successfully with SMS confirmation');

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