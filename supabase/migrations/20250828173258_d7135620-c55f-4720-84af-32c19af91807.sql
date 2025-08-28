-- Add SMS confirmation step to booking workflow
UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      steps_config,
      '{workflow_steps,sms_confirmation_sent}',
      '{"id": "sms_confirmation_sent", "name": "Confirmación Enviada", "description": "Mensaje de confirmación enviado al teléfono del cliente", "actor": "system", "iconName": "phone"}'
    ),
    '{step_order}',
    '["waiting", "call_started", "searching_availability", "showing_availability", "confirming_appointment", "appointment_confirmed", "sms_confirmation_sent", "call_ended"]'
  ),
  '{simulate_steps}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN elem->>'id' = 'appointment_confirmed' THEN
          jsonb_build_array(
            elem,
            '{"id": "sms_confirmation_sent", "name": "Enviar confirmación", "iconName": "phone-small", "data": {"message": "Confirmación SMS enviada"}}'
          )
        ELSE jsonb_build_array(elem)
      END
    )
    FROM jsonb_array_elements(steps_config->'simulate_steps') AS elem
  ) || 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(steps_config->'simulate_steps') AS elem 
      WHERE elem->>'id' = 'call_ended'
    )
    THEN '[{"id": "call_ended", "name": "Finalizar llamada", "iconName": "x-circle-small", "data": {"message": "Llamada finalizada"}}]'::jsonb
    ELSE '[]'::jsonb
  END
),
updated_at = now()
WHERE workflow_type = 'booking';