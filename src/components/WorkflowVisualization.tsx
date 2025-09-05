import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowDown } from 'lucide-react';
import { useWorkflowConfig } from '@/hooks/useWorkflowConfig';
import { StepDataRenderer } from './StepDataRenderer';

interface WorkflowVisualizationProps {
  sessionId: string;
  workflowType: string;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ sessionId, workflowType }) => {
  const [currentStep, setCurrentStep] = useState<string>('waiting');
  const [stepData, setStepData] = useState<any>({});
  const [allStepsData, setAllStepsData] = useState<Record<string, any>>({});
  const { config, agentId, loading, error } = useWorkflowConfig(workflowType);

  // Helper function to clean up future steps when resetting/moving backwards
  const cleanupFutureSteps = (currentStep: string, stepOrder: string[], allStepsData: Record<string, any>) => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex === -1) return allStepsData; // If step not found, return as is
    
    const cleanedData: Record<string, any> = {};
    
    // Keep only steps that are at or before the current step index
    for (const [stepId, data] of Object.entries(allStepsData)) {
      const stepIndex = stepOrder.indexOf(stepId);
      if (stepIndex !== -1 && stepIndex <= currentIndex) {
        cleanedData[stepId] = data;
      }
    }
    
    return cleanedData;
  };

  useEffect(() => {
    let channel: any = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let isRealtimeWorking = false;

    // Función para cargar el estado manualmente
    const loadCurrentState = async () => {
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
        
        if (data && data.current_step) {
          console.log('🔄 Estado cargado manualmente:', data.current_step);
          setCurrentStep(data.current_step);
          setStepData(data.step_data || {});
          // Store step data for current step and clean up future steps
          setAllStepsData(prev => {
            const newData = { ...prev, [data.current_step]: data.step_data || {} };
            // Clean up future steps if stepOrder is available
            if (config?.stepOrder) {
              return cleanupFutureSteps(data.current_step, config.stepOrder, newData);
            }
            return newData;
          });
        }
      } catch (error) {
        console.error('❌ Error loading state:', error);
      }
    };

    // Configurar suscripción realtime con reintentos
    const setupRealtime = () => {
      console.log('🔗 Configurando suscripción realtime...');
      
      channel = supabase
        .channel('workflows')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workflows',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            console.log('📡 Cambio realtime recibido:', payload);
            if (payload.new && typeof payload.new === 'object') {
              const newData = payload.new as any;
              if (newData.session_id === sessionId && 
                  newData.workflow_type === workflowType && 
                  newData.current_step) {
                console.log('✅ Actualizando estado via realtime:', newData.current_step);
                setCurrentStep(newData.current_step);
                setStepData(newData.step_data || {});
                // Store step data for current step and clean up future steps
                setAllStepsData(prev => {
                  const updatedData = { ...prev, [newData.current_step]: newData.step_data || {} };
                  // Clean up future steps if stepOrder is available
                  if (config?.stepOrder) {
                    return cleanupFutureSteps(newData.current_step, config.stepOrder, updatedData);
                  }
                  return updatedData;
                });
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Estado de suscripción realtime:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime conectado - desactivando polling');
            isRealtimeWorking = true;
            // Limpiar polling si estaba activo
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.log('⚠️ Realtime falló - activando polling como respaldo');
            isRealtimeWorking = false;
            // Solo activar polling si realtime no funciona
            if (!pollInterval) {
              pollInterval = setInterval(loadCurrentState, 3000);
            }
          }
        });
    };

    // Cargar estado inicial
    loadCurrentState();
    
    // Intentar realtime primero
    setupRealtime();
    
    // Timeout de respaldo: si después de 5 segundos no hay conexión realtime, usar polling
    const fallbackTimeout = setTimeout(() => {
      if (!isRealtimeWorking && !pollInterval) {
        console.log('⏰ Timeout realtime - activando polling de respaldo');
        pollInterval = setInterval(loadCurrentState, 3000);
      }
    }, 5000);

    return () => {
      console.log('🔗 Limpiando suscripciones...');
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
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

  const { steps, stepOrder } = config;

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
        <h2 className="text-2xl font-bold mb-2">Atención al Cliente Inteligente</h2>
        <p className="text-muted-foreground mb-4">Workflow para consultas de facturación y soporte al cliente con escalado inteligente a agentes humanos</p>
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>Experimenta cómo funciona por dentro:</strong> Cada agente de voz procesa las llamadas paso a paso, 
            identificando al cliente, analizando su consulta y decidiendo si puede resolver el problema automáticamente 
            o si necesita transferir a un especialista humano. <span className="text-primary font-medium">Es como ver lo que hay debajo del iceberg.</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {stepOrder.map((stepId, index) => {
          const step = steps[stepId];
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
                      <StepDataRenderer 
                        stepData={isActive ? stepData : allStepsData[stepId]}
                        stepId={stepId}
                        isActive={isActive}
                      />
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