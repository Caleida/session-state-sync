-- Fix obsolete edge function reference in delivery_change workflow
UPDATE public.workflow_definitions 
SET steps_config = jsonb_set(
  steps_config,
  '{steps,sms_sent,action}',
  '"send-sms"'::jsonb
)
WHERE workflow_type = 'delivery_change' 
AND steps_config->'steps'->'sms_sent'->>'action' = 'send-delivery-sms';