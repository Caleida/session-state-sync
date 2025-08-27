-- Fix duplicate session_id issue in workflows table
-- First, remove existing duplicates keeping only the most recent record per session_id

DELETE FROM public.workflows 
WHERE id NOT IN (
    SELECT DISTINCT ON (session_id) id 
    FROM public.workflows 
    ORDER BY session_id, updated_at DESC
);

-- Add unique constraint on session_id to prevent future duplicates
ALTER TABLE public.workflows ADD CONSTRAINT unique_session_id UNIQUE (session_id);

-- This will ensure .upsert() works correctly:
-- - If session_id exists: UPDATE the existing record
-- - If session_id doesn't exist: INSERT new record