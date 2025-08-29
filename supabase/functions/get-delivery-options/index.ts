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
    console.log('Get delivery options request received');
    
    const { session_id, preferred_date, preferred_time, workflow_type = 'delivery_change' } = await req.json();
    
    console.log('Request data:', { session_id, preferred_date, preferred_time, workflow_type });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate delivery options for next 7 days
    const deliveryOptions = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Add morning and afternoon slots
      deliveryOptions.push(
        {
          id: `${dateStr}_morning`,
          date: dateStr,
          time_slot: "09:00 - 13:00",
          display_date: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
          display_time: "Mañana (09:00 - 13:00)",
          available: Math.random() > 0.3, // 70% availability
          cost: "Gratuito"
        },
        {
          id: `${dateStr}_afternoon`, 
          date: dateStr,
          time_slot: "14:00 - 18:00",
          display_date: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
          display_time: "Tarde (14:00 - 18:00)",
          available: Math.random() > 0.2, // 80% availability
          cost: "Gratuito"
        }
      );
    }

    // Keep only available slots and limit to 8
    const availableOptions = deliveryOptions.filter(option => option.available).slice(0, 8);

    const deliveryOptionsData = {
      delivery_options: availableOptions,
      search_criteria: {
        preferred_date,
        preferred_time
      },
      search_timestamp: new Date().toISOString(),
      total_options_found: availableOptions.length
    };

    console.log('Generated delivery options:', deliveryOptionsData);

    // Update workflow to showing_options step  
    const { data: workflow, error: upsertError } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type,
        current_step: 'showing_options',
        step_data: deliveryOptionsData,
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

    console.log('Workflow updated successfully with delivery options');

    return new Response(
      JSON.stringify({ 
        success: true,
        next_step: 'showing_options',
        delivery_options: availableOptions,
        total_found: availableOptions.length
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-delivery-options function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
