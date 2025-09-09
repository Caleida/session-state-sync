UPDATE workflow_definitions 
SET steps_config = '{
  "step_order": [
    "waiting",
    "call_started", 
    "customer_info_collected",
    "delivery_type_selected",
    "taking_order",
    "order_validated", 
    "beverages_added",
    "payment_method_selected",
    "pricing_calculated",
    "confirming_order",
    "order_confirmed",
    "sms_sent",
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
      "description": "Llamada iniciada con el cliente",
      "actor": "system",
      "icon": "phone"
    },
    "customer_info_collected": {
      "id": "customer_info_collected",
      "name": "Info Cliente Recopilada", 
      "description": "Información del cliente identificada y pregunta sobre entrega",
      "actor": "system",
      "icon": "user-check"
    },
    "delivery_type_selected": {
      "id": "delivery_type_selected",
      "name": "Tipo Entrega Seleccionado",
      "description": "Cliente eligió recoger o entrega a domicilio", 
      "actor": "user",
      "icon": "truck"
    },
    "taking_order": {
      "id": "taking_order",
      "name": "Tomando Pedido",
      "description": "Recopilando pizzas personalizadas del cliente",
      "actor": "user", 
      "icon": "notepad-text"
    },
    "order_validated": {
      "id": "order_validated",
      "name": "Pedido Validado",
      "description": "Validando tamaños e ingredientes de las pizzas",
      "actor": "system",
      "icon": "check-circle"
    },
    "beverages_added": {
      "id": "beverages_added", 
      "name": "Bebidas Añadidas",
      "description": "Cliente seleccionó bebidas opcionales",
      "actor": "user",
      "icon": "coffee"
    },
    "payment_method_selected": {
      "id": "payment_method_selected",
      "name": "Método Pago Seleccionado", 
      "description": "Cliente eligió forma de pago",
      "actor": "user", 
      "icon": "credit-card"
    },
    "pricing_calculated": {
      "id": "pricing_calculated",
      "name": "Precio Calculado",
      "description": "Calculando total del pedido con entregas",
      "actor": "system",
      "icon": "calculator"
    },
    "confirming_order": {
      "id": "confirming_order",
      "name": "Confirmando Pedido", 
      "description": "Procesando y registrando el pedido final",
      "actor": "system",
      "icon": "check-circle-2"
    },
    "order_confirmed": {
      "id": "order_confirmed",
      "name": "Pedido Confirmado",
      "description": "Pedido registrado exitosamente",
      "actor": "system", 
      "icon": "package-check"
    },
    "sms_sent": {
      "id": "sms_sent",
      "name": "SMS Enviado",
      "description": "Confirmación enviada por mensaje",
      "actor": "system",
      "icon": "message-square"
    },
    "call_ended": {
      "id": "call_ended",
      "name": "Llamada Finalizada", 
      "description": "Llamada terminada exitosamente",
      "actor": "system",
      "icon": "phone-off"
    }
  }
}'::jsonb,
updated_at = now()
WHERE workflow_type = 'order_management';