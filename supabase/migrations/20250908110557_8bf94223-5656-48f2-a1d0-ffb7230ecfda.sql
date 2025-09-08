-- Actualizar package_incident workflow sin customer_identified
UPDATE workflow_definitions 
SET steps_config = '{
  "step_order": [
    "waiting",
    "call_started",
    "package_lookup",
    "understanding_issue",
    "intelligent_routing",
    "escalating_to_agent",
    "agent_connected",
    "call_ended"
  ],
  "steps": {
    "waiting": {
      "id": "waiting",
      "name": "Esperando",
      "description": "Esperando inicio de llamada",
      "actor": "user",
      "icon": "clock"
    },
    "call_started": {
      "id": "call_started",
      "name": "Llamada Iniciada",
      "description": "Se inicia la llamada del cliente",
      "actor": "system",
      "icon": "phone"
    },
    "package_lookup": {
      "id": "package_lookup",
      "name": "Búsqueda de Paquete",
      "description": "Localización del paquete con número de referencia",
      "actor": "beyond", 
      "icon": "package-search"
    },
    "understanding_issue": {
      "id": "understanding_issue",
      "name": "Comprensión del Problema",
      "description": "Análisis y comprensión del problema reportado",
      "actor": "beyond",
      "icon": "message-square"
    },
    "intelligent_routing": {
      "id": "intelligent_routing",
      "name": "Análisis Inteligente",
      "description": "Clasificación automática de severidad y tipo de incidencia",
      "actor": "beyond",
      "icon": "brain"
    },
    "escalating_to_agent": {
      "id": "escalating_to_agent",
      "name": "Escalando a Agente",
      "description": "Preparando transferencia a agente especializado",
      "actor": "system",
      "icon": "arrow-up"
    },
    "agent_connected": {
      "id": "agent_connected",
      "name": "Agente Conectado",
      "description": "Cliente transferido a agente humano especializado",
      "actor": "agent",
      "icon": "headphones"
    },
    "call_ended": {
      "id": "call_ended",
      "name": "Llamada Finalizada",
      "description": "Conversación completada exitosamente",
      "actor": "system",
      "icon": "phone-off"
    }
  },
  "simulation_messages": {
    "waiting": "Esperando llamada del cliente...",
    "call_started": "Llamada iniciada - conectando con el cliente",
    "package_lookup": "Localizando paquete con número de referencia proporcionado",
    "understanding_issue": "Analizando el problema reportado por el cliente",
    "intelligent_routing": "Clasificando severidad: CRÍTICA - Paquete dañado detectado",
    "escalating_to_agent": "Escalando a agente por incidencia crítica",
    "agent_connected": "Cliente conectado con agente especializado en incidencias",
    "call_ended": "Llamada finalizada - incidencia en proceso de resolución"
  }
}'::jsonb
WHERE workflow_type = 'package_incident';