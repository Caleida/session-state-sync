import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Calendar, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  actor: 'user' | 'beyond';
}

interface SimulateStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  data: any;
}

interface WorkflowConfig {
  workflowSteps: Record<string, WorkflowStep>;
  stepOrder: string[];
  simulateSteps: SimulateStep[];
}

// Mapping de strings de iconos a componentes React
const iconMap: Record<string, React.ReactNode> = {
  'phone': <Phone className="w-6 h-6" />,
  'calendar': <Calendar className="w-6 h-6" />,
  'check-circle': <CheckCircle className="w-6 h-6" />,
  'x-circle': <XCircle className="w-6 h-6" />,
  'clock': <Clock className="w-6 h-6" />,
  'search': <Search className="w-4 h-4" />,
  'phone-small': <Phone className="w-4 h-4" />,
  'calendar-small': <Calendar className="w-4 h-4" />,
  'check-circle-small': <CheckCircle className="w-4 h-4" />,
  'x-circle-small': <XCircle className="w-4 h-4" />
};

export const useWorkflowConfig = (workflowType: string) => {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflowConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: dbError } = await supabase.rpc('get_workflow_config', {
          p_workflow_type: workflowType
        });

        if (dbError) throw dbError;

        if (!data) {
          throw new Error(`Configuración de workflow '${workflowType}' no encontrada`);
        }

        // Mapear iconos de strings a componentes React
        const workflowSteps: Record<string, WorkflowStep> = {};
        Object.entries(data.workflow_steps as any).forEach(([key, step]: [string, any]) => {
          workflowSteps[key] = {
            ...step,
            icon: iconMap[step.iconName] || <Clock className="w-6 h-6" />
          };
        });

        const simulateSteps: SimulateStep[] = (data.simulate_steps as any[]).map((step: any) => ({
          ...step,
          icon: iconMap[step.iconName] || <Clock className="w-4 h-4" />
        }));

        setConfig({
          workflowSteps,
          stepOrder: data.step_order as string[],
          simulateSteps
        });

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

  return { config, loading, error };
};