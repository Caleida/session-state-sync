-- Eliminar la constraint única existente
ALTER TABLE public.workflows DROP CONSTRAINT IF EXISTS unique_session_email;

-- Añadir nueva constraint única que incluye workflow_type
-- Esto permite múltiples workflows para el mismo session_id/email pero de diferentes tipos
ALTER TABLE public.workflows ADD CONSTRAINT unique_session_email_type 
  UNIQUE (session_id, email, workflow_type);