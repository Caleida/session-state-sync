-- Primero añadir la columna workflow_type si no existe
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS workflow_type text NOT NULL DEFAULT 'appointments';

-- Eliminar la constraint única existente
ALTER TABLE public.workflows DROP CONSTRAINT IF EXISTS unique_session_email;

-- Añadir nueva constraint única que incluye workflow_type
ALTER TABLE public.workflows ADD CONSTRAINT unique_session_email_type 
  UNIQUE (session_id, email, workflow_type);