-- Add workflow_type column to existing workflows table
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS workflow_type TEXT NOT NULL DEFAULT 'appointments';

-- Create workflow_definitions table
CREATE TABLE public.workflow_definitions (
  workflow_type TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  steps_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflow_definitions
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow_definitions (public read access)
CREATE POLICY "Anyone can view workflow definitions" 
ON public.workflow_definitions 
FOR SELECT 
USING (true);

-- Insert current appointments workflow configuration
INSERT INTO public.workflow_definitions (workflow_type, name, description, agent_id, steps_config)
VALUES (
  'appointments',
  'Gestión de Citas',
  'Workflow de gestión de citas médicas con BEYOND',
  'agent_4401k0y50vsbenbrp3h7qr32ghxq',
  '{
    "workflow_steps": {
      "waiting": {
        "id": "waiting",
        "name": "Esperando llamada",
        "description": "El usuario está esperando a que inicie la conversación",
        "iconName": "phone",
        "actor": "user"
      },
      "searching": {
        "id": "searching",
        "name": "Buscando disponibilidad",
        "description": "BEYOND está buscando citas disponibles",
        "iconName": "search",
        "actor": "beyond"
      },
      "confirming": {
        "id": "confirming",
        "name": "Confirmando cita",
        "description": "BEYOND está confirmando los detalles de la cita",
        "iconName": "calendar",
        "actor": "beyond"
      },
      "confirmed": {
        "id": "confirmed",
        "name": "Cita confirmada",
        "description": "La cita ha sido confirmada exitosamente",
        "iconName": "check-circle",
        "actor": "beyond"
      },
      "cancelled": {
        "id": "cancelled",
        "name": "Cita cancelada",
        "description": "La cita ha sido cancelada",
        "iconName": "x-circle",
        "actor": "beyond"
      }
    },
    "step_order": ["waiting", "searching", "confirming", "confirmed"],
    "simulate_steps": [
      {
        "id": "searching",
        "name": "Buscar",
        "iconName": "search",
        "data": { "message": "Buscando disponibilidad..." }
      },
      {
        "id": "confirming", 
        "name": "Confirmar",
        "iconName": "calendar",
        "data": { "message": "Confirmando cita..." }
      },
      {
        "id": "confirmed",
        "name": "Completar", 
        "iconName": "check-circle",
        "data": { "message": "Cita confirmada!" }
      },
      {
        "id": "cancelled",
        "name": "Cancelar",
        "iconName": "x-circle", 
        "data": { "message": "Cita cancelada" }
      }
    ]
  }'::jsonb
);

-- Add trigger for updated_at on workflow_definitions
CREATE TRIGGER update_workflow_definitions_updated_at
BEFORE UPDATE ON public.workflow_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();