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
    console.log('Get delivery options request received');
    
    const { 
      session_id, 
      current_step, 
      preferred_date, 
      preferred_time 
    } = await req.json();
    const workflow_type = 'delivery_change';
    
    console.log('Request data:', { session_id, current_step, preferred_date, preferred_time, workflow_type });
    
    if (!session_id) {
      throw new Error('session_id is required');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const deliveryOptions = [];
    const currentDate = new Date();
    
    // Personalize based on preferred_date
    const preferredDateObj = preferred_date ? new Date(preferred_date) : null;
    const startDate = preferredDateObj && preferredDateObj > currentDate ? preferredDateObj : currentDate;
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Higher probability for preferred time slot
      const morningProbability = preferred_time === 'mañana' ? 0.8 : 0.7;
      const afternoonProbability = preferred_time === 'tarde' ? 0.8 : 0.8;
      
      if (Math.random() < morningProbability) {
        deliveryOptions.push({
          option_id: `${dateStr}_mañana`,
          date: dateStr,
          time_slot: "09:00-14:00",
          slot_type: "mañana",
          available: true,
          price_adjustment: 0
        });
      }
      
      if (Math.random() < afternoonProbability) {
        deliveryOptions.push({
          option_id: `${dateStr}_tarde`,
          date: dateStr,
          time_slot: "14:00-18:00", 
          slot_type: "tarde",
          available: true,
          price_adjustment: 0
        });
      }
    }

    const availableOptions = deliveryOptions.slice(0, 8);

    const deliveryOptionsData = {
      available_options: availableOptions,
      original_date: "2025-08-30",
      searched_at: new Date().toISOString(),
      total_options: availableOptions.length,
      search_criteria: {
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        current_step: current_step || null
      }
    };

    const { error: upsertError } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type,
        current_step: 'showing_options',
        step_data: deliveryOptionsData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (upsertError) {
      console.error('Error updating workflow:', upsertError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to update workflow',
          message: 'Error al actualizar el flujo de trabajo' 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = availableOptions.length > 0 
      ? `Encontré ${availableOptions.length} opciones de entrega disponibles${preferred_date ? ` cerca de tu fecha preferida` : ''}${preferred_time ? ` en horario ${preferred_time === 'mañana' ? 'matutino' : 'vespertino'}` : ''}`
      : 'No se encontraron opciones de entrega disponibles';

    return new Response(
      JSON.stringify({ 
        success: true,
        message,
        session_id,
        next_step: 'showing_options',
        available_options: availableOptions
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-delivery-options function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error',
        message: 'Error interno del servidor al buscar opciones de entrega'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});