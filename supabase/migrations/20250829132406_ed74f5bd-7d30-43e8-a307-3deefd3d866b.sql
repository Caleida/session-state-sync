-- Add simulation_messages to delivery_change workflow
UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  steps_config,
  '{simulation_messages}',
  '{
    "call_started": "Llamada iniciada...",
    "package_lookup": "Buscando paquete...",
    "showing_options": "Mostrando opciones...",
    "confirming_change": "Confirmando cambio...",
    "change_confirmed": "Cambio confirmado!",
    "sms_sent": "SMS enviado",
    "call_ended": "Llamada finalizada"
  }'::jsonb
)
WHERE workflow_type = 'delivery_change';