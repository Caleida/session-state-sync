import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Calendar, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconName: string;
  actor: 'user' | 'beyond';
}

interface SimulateStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  data: any;
}

interface WorkflowConfig {
  name: string;
  description: string;
  workflowSteps: Record<string, WorkflowStep>;
  stepOrder: string[];
  simulateSteps: SimulateStep[];
  simulationMessages: Record<string, string>;
}

interface WorkflowConfigReturn {
  config: WorkflowConfig | null;
  agentId: string | null;
  loading: boolean;
  error: string | null;
}

// Mapping de strings de iconos a componentes React
const iconMap: Record<string, React.ReactNode> = {
  'phone': <Phone className="w-6 h-6" />,
  'calendar': <Calendar className="w-6 h-6" />,
  'check-circle': <CheckCircle className="w-6 h-6" />,
  'x-circle': <XCircle className="w-6 h-6" />,
  'clock': <Clock className="w-6 h-6" />,
  'search': <Search className="w-6 h-6" />,
  'phone-small': <Phone className="w-4 h-4" />,
  'calendar-small': <Calendar className="w-4 h-4" />,
  'check-circle-small': <CheckCircle className="w-4 h-4" />,
  'x-circle-small': <XCircle className="w-4 h-4" />
};

export const useWorkflowConfig = (workflowType: string): WorkflowConfigReturn => {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflowConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load workflow configuration from database
        const { data, error: dbError } = await supabase
          .from('workflow_definitions')
          .select('*')
          .eq('workflow_type', workflowType)
          .single();

        if (dbError) {
          throw new Error(`Error cargando configuración: ${dbError.message}`);
        }

        if (!data) {
          throw new Error(`Configuración de workflow '${workflowType}' no encontrada`);
        }

        // Extract configuration from database
        const stepsConfig = data.steps_config as any;
        
        // Map icons from strings to components React
        const workflowSteps: Record<string, WorkflowStep> = {};
        Object.entries(stepsConfig.workflow_steps as any).forEach(([key, step]: [string, any]) => {
          workflowSteps[key] = {
            ...step,
            icon: iconMap[step.iconName] || <Clock className="w-6 h-6" />
          };
        });

        // Extract simulation messages (fallback to existing structure if not migrated yet)
        const simulationMessages = stepsConfig.simulation_messages || {};
        
        // Generate simulateSteps automatically from workflowSteps
        const simulateSteps: SimulateStep[] = stepsConfig.step_order
          .filter((stepId: string) => stepId !== 'waiting') // Exclude waiting step
          .map((stepId: string) => {
            const step = workflowSteps[stepId];
            if (!step) return null;
            
            // Get message from simulation_messages or fallback to existing simulate_steps
            let message = simulationMessages[stepId];
            if (!message && stepsConfig.simulate_steps) {
              const existingStep = stepsConfig.simulate_steps.find((s: any) => s.id === stepId);
              message = existingStep?.data?.message || `${step.name}...`;
            }
            
            return {
              id: stepId,
              name: step.name,
              icon: iconMap[step.iconName.replace('-small', '') + '-small'] || iconMap[step.iconName] || <Clock className="w-4 h-4" />,
              data: { message }
            };
          })
          .filter(Boolean) as SimulateStep[];

        setConfig({
          name: data.name,
          description: data.description,
          workflowSteps,
          stepOrder: stepsConfig.step_order as string[],
          simulateSteps,
          simulationMessages
        });
        
        setAgentId(data.agent_id);

      } catch (err) {
        console.error('Error loading workflow config:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (workflowType) {
      loadWorkflowConfig();
    }
  }, [workflowType]);

  return { config, agentId, loading, error };
};