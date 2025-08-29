import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Calendar, CheckCircle, XCircle, Clock, Search, Menu, ShoppingCart, Truck, MessageSquare, CheckCircle2 } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  actor: 'user' | 'beyond' | 'system';
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
  steps: Record<string, WorkflowStep>;
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
  'phone-call': <Phone className="w-6 h-6" />,
  'phone-off': <Phone className="w-6 h-6" />,
  'calendar': <Calendar className="w-6 h-6" />,
  'check-circle': <CheckCircle className="w-6 h-6" />,
  'check-circle-2': <CheckCircle2 className="w-6 h-6" />,
  'shield-check': <CheckCircle className="w-6 h-6" />,
  'x-circle': <XCircle className="w-6 h-6" />,
  'clock': <Clock className="w-6 h-6" />,
  'search': <Search className="w-6 h-6" />,
  'package-search': <Search className="w-6 h-6" />,
  'menu': <Menu className="w-6 h-6" />,
  'shopping-cart': <ShoppingCart className="w-6 h-6" />,
  'truck': <Truck className="w-6 h-6" />,
  'message-square': <MessageSquare className="w-6 h-6" />,
  'message-circle': <CheckCircle className="w-6 h-6" />,
  'phone-small': <Phone className="w-4 h-4" />,
  'calendar-small': <Calendar className="w-4 h-4" />,
  'check-circle-small': <CheckCircle className="w-4 h-4" />,
  'check-circle-2-small': <CheckCircle2 className="w-4 h-4" />,
  'x-circle-small': <XCircle className="w-4 h-4" />,
  'menu-small': <Menu className="w-4 h-4" />,
  'shopping-cart-small': <ShoppingCart className="w-4 h-4" />,
  'truck-small': <Truck className="w-4 h-4" />,
  'message-square-small': <MessageSquare className="w-4 h-4" />
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
        
        // All workflows now use standardized snake_case format
        const stepsData = stepsConfig.steps;
        const steps: Record<string, WorkflowStep> = {};
        
        Object.entries(stepsData as any).forEach(([key, step]: [string, any]) => {
          const iconKey = step.icon;
          steps[key] = {
            id: step.id || key,
            name: step.name,
            description: step.description,
            actor: step.actor || 'user',
            icon: iconMap[iconKey] || <Clock className="w-6 h-6" />
          };
        });

        // Extract simulation messages
        const simulationMessages = stepsConfig.simulation_messages || {};
        
        // Get step order using standardized snake_case
        const stepOrder = stepsConfig.step_order;
        
        // Generate simulateSteps automatically from steps
        const simulateSteps: SimulateStep[] = stepOrder
          ? stepOrder.filter((stepId: string) => stepId !== 'waiting') // Exclude waiting step
          .map((stepId: string) => {
            const step = steps[stepId];
            if (!step) return null;
            
            // Get message from simulation_messages
            const message = simulationMessages[stepId] || `${step.name}...`;
            
            return {
              id: stepId,
              name: step.name,
              icon: iconMap[stepId + '-small'] || iconMap[stepId] || <Clock className="w-4 h-4" />,
              data: { message }
            };
          })
          .filter(Boolean) as SimulateStep[]
          : [];

        setConfig({
          name: data.name,
          description: data.description,
          steps,
          stepOrder: stepOrder || [],
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