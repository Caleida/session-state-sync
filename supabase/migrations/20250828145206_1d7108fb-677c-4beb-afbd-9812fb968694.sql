-- Restaurar los pasos originales del workflow exactamente como estaban
UPDATE workflow_definitions 
SET steps_config = '{
  "workflow_steps": {
    "waiting": {
      "id": "waiting",
      "name": "Esperando",
      "description": "Esperando inicio de llamada",
      "iconName": "clock",
      "actor": "user"
    },
    "call_started": {
      "id": "call_started", 
      "name": "Llamada Iniciada",
      "description": "Teléfono de origen conectado",
      "iconName": "phone",
      "actor": "user"
    },
    "searching_availability": {
      "id": "searching_availability",
      "name": "Buscando Disponibilidad", 
      "description": "Consultando BEYOND Citas API",
      "iconName": "calendar",
      "actor": "beyond"
    },
    "showing_availability": {
      "id": "showing_availability",
      "name": "Mostrando Disponibilidad",
      "description": "Presentando opciones de citas",
      "iconName": "calendar", 
      "actor": "user"
    },
    "confirming_appointment": {
      "id": "confirming_appointment",
      "name": "Confirmando Cita",
      "description": "Enviando confirmación a BEYOND Citas",
      "iconName": "check-circle",
      "actor": "beyond"
    },
    "appointment_confirmed": {
      "id": "appointment_confirmed",
      "name": "Cita Confirmada", 
      "description": "Cita registrada exitosamente",
      "iconName": "check-circle",
      "actor": "user"
    },
    "call_ended": {
      "id": "call_ended",
      "name": "Llamada Finalizada",
      "description": "Proceso completado", 
      "iconName": "x-circle",
      "actor": "user"
    }
  },
  "step_order": ["waiting", "call_started", "searching_availability", "showing_availability", "confirming_appointment", "appointment_confirmed", "call_ended"],
  "simulate_steps": [
    {
      "id": "call_started",
      "name": "Iniciar llamada",
      "iconName": "phone-small",
      "data": {
        "message": "Llamada iniciada..."
      }
    },
    {
      "id": "searching_availability", 
      "name": "Buscar disponibilidad",
      "iconName": "calendar-small",
      "data": {
        "message": "Buscando disponibilidad..."
      }
    },
    {
      "id": "showing_availability",
      "name": "Mostrar disponibilidad", 
      "iconName": "calendar-small",
      "data": {
        "message": "Mostrando opciones..."
      }
    },
    {
      "id": "confirming_appointment",
      "name": "Confirmar cita",
      "iconName": "check-circle-small", 
      "data": {
        "message": "Confirmando cita..."
      }
    },
    {
      "id": "appointment_confirmed",
      "name": "Cita confirmada",
      "iconName": "check-circle-small",
      "data": {
        "message": "Cita confirmada!"
      }
    },
    {
      "id": "call_ended",
      "name": "Finalizar llamada",
      "iconName": "x-circle-small",
      "data": {
        "message": "Llamada finalizada"
      }
    }
  ]
}'::jsonb
WHERE workflow_type = 'appointments';