-- Insert delivery_change workflow definition
INSERT INTO public.workflow_definitions (
  workflow_type,
  name, 
  description,
  agent_id,
  steps_config
) VALUES (
  'delivery_change',
  'Cambio de Entrega de Paquetería',
  'Workflow para gestionar cambios de fecha y dirección de entrega de paquetes',
  'agent_paqueteria_01',
  '{
    "step_order": [
      "waiting",
      "call_started", 
      "package_lookup",
      "showing_options",
      "confirming_change",
      "change_confirmed",
      "sms_sent",
      "call_ended"
    ],
    "steps": {
      "waiting": {
        "name": "Esperando Llamada",
        "description": "Sistema esperando llamada entrante del cliente",
        "icon": "phone",
        "actor": "system",
        "action": null
      },
      "call_started": {
        "name": "Llamada Iniciada", 
        "description": "Llamada entrante recibida y procesada",
        "icon": "phone-call",
        "actor": "system",
        "action": "notify-call-started"
      },
      "package_lookup": {
        "name": "Buscando Paquete",
        "description": "Búsqueda del paquete en el sistema usando número de tracking",
        "icon": "package-search",
        "actor": "system", 
        "action": "lookup-package"
      },
      "showing_options": {
        "name": "Mostrando Opciones",
        "description": "Presentando opciones de cambio de entrega disponibles",
        "icon": "calendar",
        "actor": "system",
        "action": "get-delivery-options"
      },
      "confirming_change": {
        "name": "Confirmando Cambio",
        "description": "Procesando y confirmando el cambio de entrega seleccionado",
        "icon": "check-circle",
        "actor": "system",
        "action": "confirm-delivery-change"
      },
      "change_confirmed": {
        "name": "Cambio Confirmado",
        "description": "Cambio de entrega registrado exitosamente en el sistema",
        "icon": "shield-check",
        "actor": "system",
        "action": null
      },
      "sms_sent": {
        "name": "SMS Enviado",
        "description": "SMS de confirmación enviado al cliente",
        "icon": "message-circle",
        "actor": "system",
        "action": "send-delivery-sms"
      },
      "call_ended": {
        "name": "Llamada Finalizada",
        "description": "Conversación completada exitosamente",
        "icon": "phone-off",
        "actor": "system",
        "action": "notify-call-ended"
      }
    }
  }'::jsonb
);