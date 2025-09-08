-- Fix package_incident workflow structure to match expected format
UPDATE workflow_definitions 
SET steps_config = '{
  "step_order": [
    "call_started",
    "customer_identification", 
    "package_search",
    "incident_analysis",
    "agent_handoff",
    "call_summary"
  ],
  "steps": {
    "call_started": {
      "id": "call_started",
      "name": "Llamada Iniciada",
      "description": "Se inicia la llamada del cliente",
      "actor": "system",
      "icon": "phone"
    },
    "customer_identification": {
      "id": "customer_identification", 
      "name": "Identificación del Cliente",
      "description": "Identificación y verificación del cliente que llama",
      "actor": "beyond",
      "icon": "search"
    },
    "package_search": {
      "id": "package_search",
      "name": "Búsqueda de Paquete",
      "description": "Búsqueda del paquete en el sistema",
      "actor": "beyond", 
      "icon": "package-search"
    },
    "incident_analysis": {
      "id": "incident_analysis",
      "name": "Análisis del Incidente",
      "description": "Análisis del tipo y severidad del incidente",
      "actor": "beyond",
      "icon": "shield-check"
    },
    "agent_handoff": {
      "id": "agent_handoff",
      "name": "Transferencia a Agente",
      "description": "Transferencia a un agente humano especializado",
      "actor": "system",
      "icon": "phone"
    },
    "call_summary": {
      "id": "call_summary",
      "name": "Resumen de Llamada",
      "description": "Resumen de la llamada y próximos pasos",
      "actor": "system",
      "icon": "check-circle-2"
    }
  },
  "simulation_messages": {
    "call_started": "Llamada iniciada - conectando con el cliente",
    "customer_identification": "Identificando al cliente en el sistema",
    "package_search": "Buscando información del paquete",
    "incident_analysis": "Analizando el tipo de incidente reportado",
    "agent_handoff": "Transfiriendo a agente especializado",
    "call_summary": "Generando resumen de la llamada"
  }
}'::jsonb
WHERE workflow_type = 'package_incident';