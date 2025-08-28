import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';
import { useWorkflowConfig } from '@/hooks/useWorkflowConfig';

interface WorkflowSimulatorProps {
  sessionId: string;
  email: string;
  workflowType: string;
}

export const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({ sessionId, email, workflowType }) => {
  const { toast } = useToast();
  const { config, agentId, loading, error } = useWorkflowConfig(workflowType);

  const updateWorkflowStep = async (step: string, data: any = {}) => {
    console.log('🔄 Actualizando workflow:', { 
      sessionId, 
      email, 
      workflowType, 
      step, 
      data 
    });
    
    try {
      const { error, data: result } = await supabase
        .from('workflows')
        .upsert({
          session_id: sessionId,
          email,
          workflow_type: workflowType,
          current_step: step,
          step_data: data
        }, {
          onConflict: 'session_id,email,workflow_type'
        })
        .select();

      if (error) throw error;

      console.log('✅ Workflow actualizado exitosamente:', result);

      toast({
        title: "Paso actualizado",
        description: `Workflow actualizado a: ${step}`,
      });
    } catch (error) {
      console.error('❌ Error updating workflow:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el workflow",
        variant: "destructive",
      });
    }
  };

  const resetWorkflow = () => {
    updateWorkflowStep('waiting', { message: 'Workflow reiniciado' });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 text-center">
          <p>Cargando configuración del simulador...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !config) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Error: {error || 'Configuración no disponible'}</p>
        </CardContent>
      </Card>
    );
  }

  const { simulateSteps } = config;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Simulador de Workflow</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {simulateSteps.map((step) => (
            <Button
              key={step.id}
              variant="outline"
              className="flex items-center space-x-2 h-auto p-4"
              onClick={() => updateWorkflowStep(step.id, step.data)}
            >
              {step.icon}
              <span className="text-sm">{step.name}</span>
            </Button>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            onClick={resetWorkflow}
            className="w-full"
          >
            Reiniciar Workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};