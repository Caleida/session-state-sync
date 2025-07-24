-- Create workflows table for real-time workflow tracking
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  email TEXT NOT NULL,
  current_step TEXT NOT NULL DEFAULT 'waiting',
  step_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since it's a demo component)
CREATE POLICY "Anyone can view workflows" 
ON public.workflows 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert workflows" 
ON public.workflows 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update workflows" 
ON public.workflows 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for workflows table
ALTER TABLE public.workflows REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;