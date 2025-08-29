-- Add customer support workflow configuration
INSERT INTO workflow_definitions (
  workflow_type, 
  name, 
  description, 
  agent_id,
  steps_config
) VALUES (
  'customer_support',
  'Atención al Cliente Inteligente',
  'Workflow para consultas de facturación y soporte al cliente con escalado inteligente a agentes humanos',
  'agent_customer_support_001',
  '{
    "steps": {
      "waiting": {
        "id": "waiting",
        "name": "Esperando",
        "description": "Esperando inicio de llamada",
        "icon": "clock",
        "actor": "user"
      },
      "call_started": {
        "id": "call_started", 
        "name": "Llamada Iniciada",
        "description": "Llamada entrante recibida",
        "icon": "phone",
        "actor": "system"
      },
      "customer_identified": {
        "id": "customer_identified",
        "name": "Cliente Identificado", 
        "description": "Identificación automática vía CRM y visión 360°",
        "icon": "user-check",
        "actor": "system"
      },
      "billing_inquiry": {
        "id": "billing_inquiry",
        "name": "Consulta de Facturación",
        "description": "Cliente consulta sobre su factura",
        "icon": "receipt",
        "actor": "user"
      },
      "analyzing_bill": {
        "id": "analyzing_bill", 
        "name": "Analizando Factura",
        "description": "Revisión en tiempo real de cargos y servicios",
        "icon": "search",
        "actor": "system"
      },
      "explaining_charges": {
        "id": "explaining_charges",
        "name": "Explicando Cargos",
        "description": "Detalle específico de incrementos y servicios",
        "icon": "info",
        "actor": "system"
      },
      "offering_solution": {
        "id": "offering_solution",
        "name": "Ofreciendo Solución", 
        "description": "Propuesta de cancelación o modificación de servicios",
        "icon": "settings",
        "actor": "system"
      },
      "escalating_to_agent": {
        "id": "escalating_to_agent",
        "name": "Escalando a Agente",
        "description": "Transferencia inteligente con contexto completo",
        "icon": "user-plus",
        "actor": "system"
      },
      "agent_connected": {
        "id": "agent_connected",
        "name": "Agente Conectado",
        "description": "Agente humano recibe el caso con contexto completo",
        "icon": "headphones",
        "actor": "agent"
      },
      "call_ended": {
        "id": "call_ended",
        "name": "Llamada Finalizada", 
        "description": "Conversación completada exitosamente",
        "icon": "phone-off",
        "actor": "system"
      }
    },
    "step_order": [
      "waiting",
      "call_started", 
      "customer_identified",
      "billing_inquiry",
      "analyzing_bill", 
      "explaining_charges",
      "offering_solution",
      "escalating_to_agent",
      "agent_connected",
      "call_ended"
    ],
    "simulation_messages": {
      "waiting": "Esperando llamada...",
      "call_started": "Llamada iniciada...",
      "customer_identified": "Cliente identificado automáticamente",
      "billing_inquiry": "Consultando sobre factura...", 
      "analyzing_bill": "Analizando cargos en tiempo real...",
      "explaining_charges": "Explicando incremento detectado",
      "offering_solution": "Ofreciendo cancelación de servicio",
      "escalating_to_agent": "Transfiriendo a agente especializado...",
      "agent_connected": "Agente conectado con contexto completo",
      "call_ended": "Llamada finalizada exitosamente"
    }
  }'
);