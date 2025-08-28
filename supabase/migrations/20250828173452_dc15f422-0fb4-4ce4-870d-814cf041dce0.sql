-- Fix the corrupted simulate_steps structure in booking workflow
UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  steps_config,
  '{simulate_steps}',
  '[
    {"id": "call_started", "name": "Iniciar llamada", "iconName": "phone-small", "data": {"message": "Llamada iniciada..."}},
    {"id": "searching_availability", "name": "Buscar disponibilidad", "iconName": "calendar-small", "data": {"message": "Buscando disponibilidad..."}},
    {"id": "showing_availability", "name": "Mostrar disponibilidad", "iconName": "calendar-small", "data": {"message": "Mostrando opciones..."}},
    {"id": "confirming_appointment", "name": "Confirmar cita", "iconName": "check-circle-small", "data": {"message": "Confirmando cita..."}},
    {"id": "appointment_confirmed", "name": "Cita confirmada", "iconName": "check-circle-small", "data": {"message": "Cita confirmada!"}},
    {"id": "sms_confirmation_sent", "name": "Enviar confirmación", "iconName": "phone-small", "data": {"message": "Confirmación SMS enviada"}},
    {"id": "call_ended", "name": "Finalizar llamada", "iconName": "x-circle-small", "data": {"message": "Llamada finalizada"}}
  ]'::jsonb
),
updated_at = now()
WHERE workflow_type = 'booking';