-- Insert pizzeria order management workflow definition
INSERT INTO public.workflow_definitions (
  workflow_type,
  name,
  description,
  agent_id,
  steps_config
) VALUES (
  'order_management',
  'Gestión de Pedidos - Pizzería',
  'Workflow para tomar pedidos telefónicos de pizzería con agente de IA',
  'pizzeria_agent_001',
  '{
    "stepOrder": ["waiting", "call_started", "product_lookup", "showing_catalog", "selecting_products", "calculating_delivery", "confirming_order", "order_confirmed", "sms_sent", "call_ended"],
    "steps": {
      "waiting": {
        "id": "waiting",
        "name": "Esperando",
        "description": "Esperando inicio de llamada",
        "actor": "user",
        "iconName": "clock",
        "action": null
      },
      "call_started": {
        "id": "call_started", 
        "name": "Llamada Iniciada",
        "description": "Llamada iniciada con el cliente",
        "actor": "system",
        "iconName": "phone",
        "action": "notify-call-started"
      },
      "product_lookup": {
        "id": "product_lookup",
        "name": "Buscando Productos",
        "description": "Consultando catálogo de productos disponibles",
        "actor": "system", 
        "iconName": "search",
        "action": "search-products"
      },
      "showing_catalog": {
        "id": "showing_catalog",
        "name": "Mostrando Catálogo",
        "description": "Presentando menú de pizzas y productos",
        "actor": "system",
        "iconName": "menu",
        "action": null
      },
      "selecting_products": {
        "id": "selecting_products",
        "name": "Seleccionando Productos",
        "description": "Cliente eligiendo pizzas y personalizaciones",
        "actor": "user",
        "iconName": "shopping-cart",
        "action": null
      },
      "calculating_delivery": {
        "id": "calculating_delivery",
        "name": "Calculando Entrega",
        "description": "Determinando tiempo y costo de delivery",
        "actor": "system",
        "iconName": "truck",
        "action": "calculate-delivery"
      },
      "confirming_order": {
        "id": "confirming_order", 
        "name": "Confirmando Pedido",
        "description": "Procesando y registrando el pedido",
        "actor": "system",
        "iconName": "check-circle",
        "action": "process-order"
      },
      "order_confirmed": {
        "id": "order_confirmed",
        "name": "Pedido Confirmado", 
        "description": "Pedido registrado exitosamente",
        "actor": "system",
        "iconName": "check-circle-2",
        "action": null
      },
      "sms_sent": {
        "id": "sms_sent",
        "name": "SMS Enviado",
        "description": "Confirmación enviada por mensaje",
        "actor": "system", 
        "iconName": "message-square",
        "action": "send-sms"
      },
      "call_ended": {
        "id": "call_ended",
        "name": "Llamada Finalizada",
        "description": "Llamada terminada exitosamente",
        "actor": "system",
        "iconName": "phone-off", 
        "action": "notify-call-ended"
      }
    }
  }'::jsonb
);