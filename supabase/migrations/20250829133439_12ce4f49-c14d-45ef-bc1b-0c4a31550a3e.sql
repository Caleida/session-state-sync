-- Update waiting step in delivery_change workflow to match booking format
UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  steps_config,
  '{steps,waiting}',
  '{
    "action": null,
    "actor": "user",
    "description": "Esperando inicio de llamada",
    "icon": "clock",
    "name": "Esperando"
  }'::jsonb
)
WHERE workflow_type = 'delivery_change';