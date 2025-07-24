import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Calendar, CheckCircle, XCircle, Clock, ArrowDown } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  actor: 'user' | 'beyond';
}

const workflowSteps: Record<string, WorkflowStep> = {
  waiting: {
    id: 'waiting',
    name: 'Esperando',
    description: 'Esperando inicio de llamada',
    icon: <Clock className="w-6 h-6" />,
    actor: 'user'
  },
  call_started: {
    id: 'call_started',
    name: 'Llamada Iniciada',
    description: 'Teléfono de origen conectado',
    icon: <Phone className="w-6 h-6" />,
    actor: 'user'
  },
  searching_availability: {
    id: 'searching_availability',
    name: 'Buscando Disponibilidad',
    description: 'Consultando BEYOND Citas API',
    icon: <Calendar className="w-6 h-6" />,
    actor: 'beyond'
  },
  showing_availability: {
    id: 'showing_availability',
    name: 'Mostrando Disponibilidad',
    description: 'Presentando opciones de citas',
    icon: <Calendar className="w-6 h-6" />,
    actor: 'user'
  },
  confirming_appointment: {
    id: 'confirming_appointment',
    name: 'Confirmando Cita',
    description: 'Enviando confirmación a BEYOND Citas',
    icon: <CheckCircle className="w-6 h-6" />,
    actor: 'beyond'
  },
  appointment_confirmed: {
    id: 'appointment_confirmed',
    name: 'Cita Confirmada',
    description: 'Cita registrada exitosamente',
    icon: <CheckCircle className="w-6 h-6" />,
    actor: 'user'
  },
  call_ended: {
    id: 'call_ended',
    name: 'Llamada Finalizada',
    description: 'Proceso completado',
    icon: <XCircle className="w-6 h-6" />,
    actor: 'user'
  }
};

const stepOrder = ['waiting', 'call_started', 'searching_availability', 'showing_availability', 'confirming_appointment', 'appointment_confirmed', 'call_ended'];

interface WorkflowVisualizationProps {
  sessionId: string;
  email: string;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ sessionId, email }) => {
  const [currentStep, setCurrentStep] = useState<string>('waiting');
  const [stepData, setStepData] = useState<any>({});

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('workflow-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflows',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Workflow change:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            if (newData.current_step) {
              setCurrentStep(newData.current_step);
              setStepData(newData.step_data || {});
            }
          }
        }
      )
      .subscribe();

    // Load initial state
    const loadInitialState = async () => {
      const { data } = await supabase
        .from('workflows')
        .select('current_step, step_data')
        .eq('session_id', sessionId)
        .single();
      
      if (data && data.current_step) {
        setCurrentStep(data.current_step);
        setStepData(data.step_data || {});
      }
    };

    loadInitialState();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const getStepIndex = (step: string) => stepOrder.indexOf(step);
  const currentStepIndex = getStepIndex(currentStep);

  const getStepStatus = (step: string) => {
    const stepIndex = getStepIndex(step);
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Workflow de Gestión de Citas</h2>
        <p className="text-muted-foreground">Email: {email}</p>
        <p className="text-sm text-muted-foreground">Session ID: {sessionId}</p>
      </div>

      <div className="space-y-4">
        {stepOrder.map((stepId, index) => {
          const step = workflowSteps[stepId];
          const status = getStepStatus(stepId);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';

          return (
            <div key={stepId} className="relative">
              <Card className={`p-6 transition-all duration-500 ${
                isActive ? 'border-primary shadow-lg scale-105 animate-pulse' : 
                isCompleted ? 'border-green-500 bg-green-50' : 
                'border-muted'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      isActive ? 'bg-primary text-primary-foreground' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-muted'
                    }`}>
                      {step.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isActive ? 'text-primary' : ''}`}>
                        {step.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {isActive && stepData.message && (
                        <p className="text-sm text-primary mt-1">{stepData.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={step.actor === 'user' ? 'default' : 'secondary'}>
                      {step.actor === 'user' ? 'Usuario' : 'BEYOND Citas'}
                    </Badge>
                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                </div>
              </Card>
              
              {index < stepOrder.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown className={`w-6 h-6 transition-colors duration-300 ${
                    index < currentStepIndex ? 'text-green-500' : 
                    index === currentStepIndex ? 'text-primary animate-bounce' : 
                    'text-muted-foreground'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};