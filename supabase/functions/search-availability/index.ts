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
    console.log('Search availability request received');
    
    const { session_id, current_step, preferred_date, preferred_time, service_type, workflow_type } = await req.json();
    
    console.log('Request data:', { session_id, current_step, preferred_date, preferred_time, service_type, workflow_type });

    // Initialize Supabase client
    const supabase = createClient(
      'https://uoskbpqmlvgrwoqosnew.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2ticHFtbHZncndvcW9zbmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDgzMDgsImV4cCI6MjA2ODkyNDMwOH0.iyK012ElyB_SHOczPRbQcUbon0oV6yYqXs6htmuKv2M'
    );

    // Generate random availability for next 7 days
    const availableSlots = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate 3-5 random slots per day between 9:00 and 18:00
      const slotsCount = Math.floor(Math.random() * 3) + 3;
      
      for (let j = 0; j < slotsCount; j++) {
        const hour = Math.floor(Math.random() * 9) + 9; // 9-17
        const minutes = Math.random() < 0.5 ? 0 : 30;
        
        const slotDate = new Date(date);
        slotDate.setHours(hour, minutes, 0, 0);
        
        availableSlots.push({
          datetime: slotDate.toISOString(),
          date: slotDate.toLocaleDateString('es-ES'),
          time: slotDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          service_type: service_type || 'Consulta general'
        });
      }
    }

    // Sort by datetime
    availableSlots.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    // Take only first 10 slots
    const limitedSlots = availableSlots.slice(0, 10);

    console.log(`Generated ${limitedSlots.length} available slots`);

    // Update workflow status
    const stepData = {
      available_slots: limitedSlots,
      search_criteria: {
        preferred_date,
        preferred_time,
        service_type
      },
      searched_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('workflows')
      .upsert({
        session_id: session_id,
        workflow_type: workflow_type || 'appointments',
        current_step: 'showing_availability',
        step_data: stepData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (updateError) {
      console.error('Error updating workflow:', updateError);
      throw new Error('Failed to update workflow');
    }

    console.log('Workflow updated successfully');

    // Return response for ElevenLabs
    const response = {
      success: true,
      message: `Encontré ${limitedSlots.length} citas disponibles para los próximos días`,
      available_slots: limitedSlots,
      session_id,
      next_step: 'showing_availability'
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-availability function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error al buscar disponibilidad'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});