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
    console.log('End call request received');
    
    const { 
      session_id, 
      email, 
      call_duration, 
      termination_reason,
      call_summary 
    } = await req.json();
    
    console.log('Request data:', { 
      session_id, 
      email, 
      call_duration, 
      termination_reason 
    });

    // Validate required fields
    if (!session_id || !email) {
      throw new Error('session_id and email are required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      'https://uoskbpqmlvgrwoqosnew.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2ticHFtbHZncndvcW9zbmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDgzMDgsImV4cCI6MjA2ODkyNDMwOH0.iyK012ElyB_SHOczPRbQcUbon0oV6yYqXs6htmuKv2M'
    );

    // Create call termination data
    const callEndData = {
      call_duration: call_duration || null,
      termination_reason: termination_reason || 'conversation_completed',
      call_summary: call_summary || null,
      ended_at: new Date().toISOString(),
      completed_successfully: true
    };

    console.log('Generated call end data:', callEndData);

    // Update workflow status to call_ended
    const stepData = {
      call_termination: callEndData,
      completion_details: {
        message: 'Llamada finalizada exitosamente',
        duration: call_duration || 'No especificado',
        reason: termination_reason || 'Conversación completada',
        ended_at: new Date().toLocaleString('es-ES', {
          timeZone: 'Europe/Madrid',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
    };

    const { error: updateError } = await supabase
      .from('workflows')
      .upsert({
        session_id: session_id,
        email: email,
        current_step: 'call_ended',
        step_data: stepData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,email'
      });

    if (updateError) {
      console.error('Error updating workflow:', updateError);
      throw new Error('Failed to update workflow to call_ended state');
    }

    console.log('Workflow updated successfully to call_ended');

    // Return response for ElevenLabs agent
    const response = {
      success: true,
      message: 'Llamada finalizada y registrada correctamente',
      session_id,
      call_duration: call_duration || 'No especificado',
      termination_reason: termination_reason || 'Conversación completada',
      next_step: 'call_ended',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in end-call function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error al finalizar la llamada'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});