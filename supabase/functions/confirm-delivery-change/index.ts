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
    console.log('Confirm delivery change request received');
    
    const { 
      session_id, 
      selected_option_id, 
      new_address, 
      contact_name, 
      contact_phone,
      workflow_type = 'delivery_change' 
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const confirmationNumber = `DLC${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    const [selectedDate, selectedSlot] = selected_option_id.split('_');
    const timeSlot = selectedSlot === 'morning' ? '09:00-14:00' : '14:00-18:00';

    const deliveryChangeData = {
      confirmed_change: {
        confirmation_number: confirmationNumber,
        new_delivery_date: selectedDate,
        new_time_slot: timeSlot,
        new_address: new_address || "Calle Mayor 45, 3º B, 28013 Madrid",
        contact_name: contact_name || "María García López",
        contact_phone: contact_phone || "+34 612 345 678",
        change_type: new_address ? "address_and_date" : "date_only"
      },
      original_delivery_date: "2025-08-30",
      confirmed_at: new Date().toISOString(),
      status: "confirmed"
    };

    const { error: upsertError } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type,
        current_step: 'change_confirmed',
        step_data: deliveryChangeData,
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
        next_step: 'change_confirmed',
        confirmation: deliveryChangeData.confirmed_change
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