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
    console.log('Confirm appointment request received');
    
    const { 
      session_id, 
      current_step, 
      selected_datetime, 
      client_name, 
      client_phone, 
      service_type, 
      notes,
      workflow_type
    } = await req.json();
    
    if (!session_id || !workflow_type || !selected_datetime) {
      throw new Error('session_id, workflow_type, and selected_datetime are required');
    }
    
    console.log('Request data:', { 
      session_id, 
      selected_datetime, 
      client_name, 
      client_phone, 
      service_type,
      workflow_type
    });

    // Initialize Supabase client
    const supabase = createClient(
      'https://uoskbpqmlvgrwoqosnew.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2ticHFtbHZncndvcW9zbmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDgzMDgsImV4cCI6MjA2ODkyNDMwOH0.iyK012ElyB_SHOczPRbQcUbon0oV6yYqXs6htmuKv2M'
    );

    // Generate confirmation number
    const confirmationNumber = `BEYOND-${Date.now().toString().slice(-6)}`;
    
    // Parse the selected datetime
    const appointmentDate = new Date(selected_datetime);
    
    // Create appointment data
    const appointmentData = {
      confirmation_number: confirmationNumber,
      client_name,
      client_phone,
      service_type: service_type || 'Consulta general',
      appointment_datetime: selected_datetime,
      appointment_date: appointmentDate.toLocaleDateString('es-ES'),
      appointment_time: appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      notes: notes || '',
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    };

    console.log('Generated appointment data:', appointmentData);

    // Update workflow status
    const stepData = {
      appointment: appointmentData,
      confirmation_details: {
        message: `Cita confirmada exitosamente para ${appointmentData.appointment_date} a las ${appointmentData.appointment_time}`,
        confirmation_number: confirmationNumber,
        next_steps: [
          'Recibirás un email de confirmación',
          'Te enviaremos un recordatorio 24 horas antes',
          'Si necesitas cancelar, llama con al menos 24 horas de anticipación'
        ]
      }
    };

    const { error: updateError } = await supabase
      .from('workflows')
      .upsert({
        session_id: session_id,
        workflow_type: workflow_type || 'appointments',
        current_step: 'appointment_confirmed',
        step_data: stepData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (updateError) {
      console.error('Error updating workflow:', updateError);
      throw new Error('Failed to update workflow');
    }

    console.log('Workflow updated successfully with confirmation');

    // Return response for ElevenLabs
    const response = {
      success: true,
      message: `¡Perfecto! Tu cita ha sido confirmada para el ${appointmentData.appointment_date} a las ${appointmentData.appointment_time}`,
      confirmation_number: confirmationNumber,
      appointment: appointmentData,
      session_id,
      next_step: 'appointment_confirmed'
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in confirm-appointment function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error al confirmar la cita. Por favor intenta nuevamente.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});