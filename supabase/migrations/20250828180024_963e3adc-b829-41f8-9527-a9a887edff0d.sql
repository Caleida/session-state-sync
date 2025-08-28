-- Remove email requirement from workflows
-- Make email column nullable and update unique constraint

-- First, make email column nullable
ALTER TABLE public.workflows ALTER COLUMN email DROP NOT NULL;

-- Drop the current unique constraint that includes email
ALTER TABLE public.workflows DROP CONSTRAINT IF EXISTS unique_session_email_type;

-- Create new unique constraint on session_id + workflow_type
ALTER TABLE public.workflows ADD CONSTRAINT unique_session_workflow_type UNIQUE (session_id, workflow_type);