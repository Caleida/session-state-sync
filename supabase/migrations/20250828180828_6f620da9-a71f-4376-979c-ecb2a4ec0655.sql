-- Add the missing unique constraint for session_id + workflow_type
ALTER TABLE public.workflows 
ADD CONSTRAINT unique_session_workflow_type UNIQUE (session_id, workflow_type);