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

        // For now, return hardcoded config since RPC function doesn't exist yet
        const defaultConfig = {
          workflow_steps: {
            waiting: {
              id: 'waiting',
              name: 'Esperando llamada',
              description: 'El usuario está esperando a que inicie la conversación',
              iconName: 'phone',
              actor: 'user'
            },
            searching: {
              id: 'searching',
              name: 'Buscando disponibilidad',
              description: 'BEYOND está buscando citas disponibles',
              iconName: 'search',
              actor: 'beyond'
            },
            confirming: {
              id: 'confirming',
              name: 'Confirmando cita',
              description: 'BEYOND está confirmando los detalles de la cita',
              iconName: 'calendar',
              actor: 'beyond'
            },
            confirmed: {
              id: 'confirmed',
              name: 'Cita confirmada',
              description: 'La cita ha sido confirmada exitosamente',
              iconName: 'check-circle',
              actor: 'beyond'
            },
            cancelled: {
              id: 'cancelled',
              name: 'Cita cancelada',
              description: 'La cita ha sido cancelada',
              iconName: 'x-circle',
              actor: 'beyond'
            }
          },
          step_order: ['waiting', 'searching', 'confirming', 'confirmed'],
          simulate_steps: [
            { id: 'searching', name: 'Buscar', iconName: 'search-small', data: { message: 'Buscando disponibilidad...' } },
            { id: 'confirming', name: 'Confirmar', iconName: 'calendar-small', data: { message: 'Confirmando cita...' } },
            { id: 'confirmed', name: 'Completar', iconName: 'check-circle-small', data: { message: 'Cita confirmada!' } },
            { id: 'cancelled', name: 'Cancelar', iconName: 'x-circle-small', data: { message: 'Cita cancelada' } }
          ]
        };

        const data = defaultConfig;

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