import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowDown } from 'lucide-react';
import { useWorkflowConfig } from '@/hooks/useWorkflowConfig';

interface WorkflowVisualizationProps {
  sessionId: string;
  email: string;
  workflowType: string;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ sessionId, email, workflowType }) => {
  const [currentStep, setCurrentStep] = useState<string>('waiting');
  const [stepData, setStepData] = useState<any>({});
  const { config, agentId, loading, error } = useWorkflowConfig(workflowType);

  useEffect(() => {
    // Subscribe to realtime changes with better error handling
    const channelName = `workflow-changes-${sessionId}`;
    console.log('🔗 Creando canal realtime:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflows',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('📡 Cambio de workflow recibido:', payload);
          console.log('📡 Filtro SessionId:', sessionId);
          console.log('📡 Evento tipo:', payload.eventType);
          
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            console.log('📡 Datos nuevos completos:', newData);
            console.log('📡 Session ID del evento:', newData.session_id);
            console.log('📡 Workflow type del evento:', newData.workflow_type);
            console.log('📡 Nuevo paso:', newData.current_step);
            
            // Verificar que coincida exactamente con nuestros parámetros
            if (newData.session_id === sessionId && 
                newData.workflow_type === workflowType && 
                newData.current_step) {
              setCurrentStep(newData.current_step);
              setStepData(newData.step_data || {});
              console.log('✅ Estado actualizado a:', newData.current_step);
            } else {
              console.log('❌ Evento filtrado - no coincide con sesión actual');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción:', status);
      });

    // Load initial state
    const loadInitialState = async () => {
      console.log('🔍 Cargando estado inicial para:', { sessionId, workflowType });
      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('current_step, step_data')
          .eq('session_id', sessionId)
          .eq('workflow_type', workflowType)
          .maybeSingle();
        
        if (error) {
          console.error('❌ Error loading workflow state:', error);
          return;
        }
        
        console.log('🔍 Estado inicial encontrado:', data);
        if (data && data.current_step) {
          setCurrentStep(data.current_step);
          setStepData(data.step_data || {});
          console.log('🔍 Estado establecido a:', data.current_step);
        } else {
          console.log('🔍 No se encontró workflow existente, usando estado por defecto: waiting');
        }
      } catch (error) {
        console.error('❌ Unexpected error loading workflow state:', error);
      }
    };

    loadInitialState();

    return () => {
      console.log('🔗 Cerrando canal realtime:', channelName);
      supabase.removeChannel(channel);
    };
  }, [sessionId, workflowType]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p>Cargando configuración del workflow...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-500">Error: {error || 'Configuración no disponible'}</p>
      </div>
    );
  }

  const { workflowSteps, stepOrder } = config;

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