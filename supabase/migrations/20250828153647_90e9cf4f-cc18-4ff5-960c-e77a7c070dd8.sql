-- Ensure workflows table is properly configured for realtime
ALTER TABLE public.workflows REPLICA IDENTITY FULL;

-- Make sure the table is in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;