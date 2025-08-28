-- Actualizar la configuración del workflow para incluir los pasos faltantes
UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      steps_config,
      '{workflow_steps,showing_availability}',
      '{
        "id": "showing_availability",
        "name": "Mostrando disponibilidad",
        "description": "BEYOND muestra las citas disponibles encontradas",
        "iconName": "calendar",
        "actor": "beyond"
      }'::jsonb
    ),
    '{workflow_steps,appointment_confirmed}',
    '{
      "id": "appointment_confirmed",
      "name": "Cita procesada",
      "description": "La cita ha sido procesada y confirmada por el sistema",
      "iconName": "check-circle",
      "actor": "beyond"
    }'::jsonb
  ),
  '{workflow_steps,call_ended}',
  '{
    "id": "call_ended",
    "name": "Llamada finalizada",
    "description": "La llamada de voz ha terminado",
    "iconName": "phone",
    "actor": "beyond"
  }'::jsonb
),
steps_config = jsonb_set(
  steps_config,
  '{step_order}',
  '["waiting", "searching", "showing_availability", "confirming", "appointment_confirmed", "confirmed", "call_ended", "cancelled"]'::jsonb
)
WHERE workflow_type = 'appointments';

-- Añadir nuevos pasos de simulación para los pasos faltantes
UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  steps_config,
  '{simulate_steps}',
  (steps_config->'simulate_steps') || '[
    {
      "id": "showing_availability",
      "name": "Mostrar disponibilidad",
      "iconName": "calendar-small",
      "data": {
        "message": "Mostrando citas disponibles..."
      }
    },
    {
      "id": "appointment_confirmed",
      "name": "Procesar confirmación",
      "iconName": "check-circle-small",
      "data": {
        "message": "Procesando confirmación..."
      }
    },
    {
      "id": "call_ended",
      "name": "Finalizar llamada",
      "iconName": "phone-small",
      "data": {
        "message": "Llamada finalizada"
      }
    }
  ]'::jsonb
)
WHERE workflow_type = 'appointments';