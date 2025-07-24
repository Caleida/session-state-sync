import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Calendar, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface WorkflowSimulatorProps {
  sessionId: string;
  email: string;
}

export const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({ sessionId, email }) => {
  const { toast } = useToast();

  const updateWorkflowStep = async (step: string, data: any = {}) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .upsert({
          session_id: sessionId,
          email,
          current_step: step,
          step_data: data
        });

      if (error) throw error;

      toast({
        title: "Paso actualizado",
        description: `Workflow actualizado a: ${step}`,
      });
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el workflow",
        variant: "destructive",
      });
    }
  };

  const simulateSteps = [
    {
      id: 'call_started',
      name: 'Iniciar Llamada',
      icon: <Phone className="w-4 h-4" />,
      data: { message: 'Llamada iniciada desde +34 123 456 789' }
    },
    {
      id: 'searching_availability',
      name: 'Buscar Disponibilidad',
      icon: <Search className="w-4 h-4" />,
      data: { message: 'Consultando API de BEYOND Citas...' }
    },
    {
      id: 'showing_availability',
      name: 'Mostrar Opciones',
      icon: <Calendar className="w-4 h-4" />,
      data: { 
        message: 'Opciones disponibles: 25/07 10:00, 26/07 15:30, 27/07 09:15',
        available_slots: ['2024-07-25T10:00:00', '2024-07-26T15:30:00', '2024-07-27T09:15:00']
      }
    },
    {
      id: 'confirming_appointment',
      name: 'Confirmar Cita',
      icon: <CheckCircle className="w-4 h-4" />,
      data: { 
        message: 'Enviando confirmación a BEYOND Citas...',
        selected_slot: '2024-07-25T10:00:00'
      }
    },
    {
      id: 'appointment_confirmed',
      name: 'Cita Confirmada',
      icon: <CheckCircle className="w-4 h-4" />,
      data: { 
        message: 'Cita confirmada para el 25/07/2024 a las 10:00',
        appointment_id: 'APT-12345'
      }
    },
    {
      id: 'call_ended',
      name: 'Finalizar Llamada',
      icon: <XCircle className="w-4 h-4" />,
      data: { message: 'Llamada finalizada. Duración: 3:42 min' }
    }
  ];

  const resetWorkflow = () => {
    updateWorkflowStep('waiting', { message: 'Workflow reiniciado' });
  };

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