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
    console.log('Confirm delivery change request received');
    
    const { 
      session_id, 
      selected_option_id, 
      new_address, 
      contact_name, 
      contact_phone,
      workflow_type = 'delivery_change' 
    } = await req.json();
    
    console.log('Request data:', { 
      session_id, 
      selected_option_id, 
      new_address, 
      contact_name, 
      contact_phone, 
      workflow_type 
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate confirmation number
    const confirmationNumber = `DEL-${Math.floor(Math.random() * 900000) + 100000}`;
    
    // Parse selected option details (assuming format: date_timeperiod)
    const [selectedDate, timePeriod] = selected_option_id.split('_');
    const timeSlot = timePeriod === 'morning' ? '09:00 - 13:00' : '14:00 - 18:00';

    const deliveryChangeData = {
      confirmation_number: confirmationNumber,
      contact_name: contact_name || "Cliente",
      contact_phone: contact_phone || "",
      new_delivery_date: selectedDate,
      new_delivery_time: timeSlot,
      new_delivery_address: new_address || "Dirección actual",
      original_delivery_date: "2025-08-30",
      change_reason: "Cambio solicitado por el cliente",
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      estimated_delivery_window: timeSlot,
      tracking_updates: [
        {
          timestamp: new Date().toISOString(),
          status: "Cambio de entrega confirmado",
          description: `Nueva fecha: ${new Date(selectedDate).toLocaleDateString('es-ES')} - ${timeSlot}`
        }
      ]
    };

    console.log('Generated delivery change data:', deliveryChangeData);

    // Update workflow to change_confirmed step
    const { data: workflow, error: upsertError } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type,
        current_step: 'change_confirmed',
        step_data: deliveryChangeData,
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

    console.log('Workflow updated successfully with confirmation');

    return new Response(
      JSON.stringify({ 
        success: true,
        next_step: 'change_confirmed',
        confirmation_number: confirmationNumber,
        delivery_details: {
          date: selectedDate,
          time_slot: timeSlot,
          address: new_address,
          contact: contact_name
        }
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in confirm-delivery-change function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});