-- Refactor workflow configuration to remove redundancy
-- Extract simulation messages and remove duplicate simulate_steps

UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  jsonb_set(
    steps_config,
    '{simulation_messages}',
    '{
      "call_started": "Llamada iniciada...",
      "searching_availability": "Buscando disponibilidad...",
      "showing_availability": "Mostrando opciones...",
      "confirming_appointment": "Confirmando cita...",
      "appointment_confirmed": "Cita confirmada!",
      "sms_confirmation_sent": "Confirmación SMS enviada",
      "call_ended": "Llamada finalizada"
    }'::jsonb
  ),
  '{simulate_steps}',
  'null'::jsonb
),
updated_at = now()
WHERE workflow_type = 'booking';