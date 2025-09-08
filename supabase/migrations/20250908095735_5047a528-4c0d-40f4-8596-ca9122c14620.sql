-- Insert the package_incident workflow definition
INSERT INTO public.workflow_definitions (
  workflow_type,
  name,
  description,
  agent_id,
  steps_config
) VALUES (
  'package_incident',
  'Gestión de Incidencias de Paquetería',
  'Workflow para gestionar incidencias críticas como paquetes dañados con escalación inteligente a agentes especializados',
  'package_incident_agent',
  '{
    "steps": [
      {
        "id": "waiting",
        "title": "Esperando llamada",
        "description": "Sistema preparado para recibir llamadas de incidencias",
        "icon": "Phone",
        "status": "waiting"
      },
      {
        "id": "call_started",
        "title": "Llamada iniciada",
        "description": "Cliente conectado para reportar incidencia",
        "icon": "PhoneCall",
        "status": "in_progress"
      },
      {
        "id": "customer_identified",
        "title": "Cliente identificado",
        "description": "Cliente identificado automáticamente en el sistema",
        "icon": "User",
        "status": "completed"
      },
      {
        "id": "package_lookup",
        "title": "Búsqueda de paquete",
        "description": "Localizando información del paquete reportado",
        "icon": "Package",
        "status": "in_progress"
      },
      {
        "id": "understanding_issue",
        "title": "Análisis de incidencia",
        "description": "Analizando tipo y severidad de la incidencia",
        "icon": "AlertTriangle",
        "status": "in_progress"
      },
      {
        "id": "intelligent_routing",
        "title": "Enrutamiento inteligente",
        "description": "Determinando mejor ruta de resolución",
        "icon": "GitBranch",
        "status": "in_progress"
      },
      {
        "id": "escalating_to_agent",
        "title": "Escalando a agente",
        "description": "Transfiriendo a especialista en incidencias",
        "icon": "UserPlus",
        "status": "in_progress"
      },
      {
        "id": "agent_connected",
        "title": "Agente conectado",
        "description": "Especialista atendiendo la incidencia",
        "icon": "Users",
        "status": "completed"
      },
      {
        "id": "call_ended",
        "title": "Llamada finalizada",
        "description": "Incidencia gestionada y llamada terminada",
        "icon": "PhoneOff",
        "status": "completed"
      }
    ],
    "simulateSteps": [
      {
        "id": "call_started",
        "title": "Iniciar llamada de incidencia",
        "description": "Simular llamada de cliente reportando paquete dañado",
        "action": "notify_call_started"
      },
      {
        "id": "customer_identified",
        "title": "Identificar cliente",
        "description": "Buscar información del cliente por teléfono",
        "action": "get_customer_info",
        "payload": {
          "phone_number": "+34612345678"
        }
      },
      {
        "id": "package_lookup", 
        "title": "Buscar paquete",
        "description": "Localizar paquete con incidencia reportada",
        "action": "lookup_package",
        "payload": {
          "tracking_number": "PKG-2025-0001-DMG"
        }
      },
      {
        "id": "understanding_issue",
        "title": "Analizar incidencia",
        "description": "Procesar y clasificar tipo de incidencia",
        "action": "process_incident_routing",
        "payload": {
          "issue_type": "damaged_package",
          "severity": "high"
        }
      },
      {
        "id": "escalating_to_agent",
        "title": "Escalar a agente",
        "description": "Transferir a especialista con contexto completo",
        "action": "escalate_to_agent",
        "payload": {
          "customer_name": "Alba García",
          "conversation_context": "Paquete dañado - Escalación automática"
        }
      },
      {
        "id": "call_ended",
        "title": "Finalizar llamada",
        "description": "Concluir gestión de incidencia",
        "action": "notify_call_ended"
      }
    ],
    "simulationMessages": [
      "🚨 Nueva incidencia crítica reportada",
      "🔍 Identificando cliente automáticamente...",
      "📦 Localizando paquete en sistema...", 
      "⚠️ Analizando severidad de incidencia...",
      "🎯 Determinando mejor ruta de resolución...",
      "👥 Transfiriendo a especialista...",
      "✅ Incidencia en proceso de resolución"
    ]
  }'::jsonb
);