import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Headphones, User, FileText } from 'lucide-react';

interface AgentHandoffDisplayProps {
  data: {
    agent_connected?: {
      agent_details: {
        agent_id: string;
        agent_name: string;
        department: string;
        specialization: string;
        estimated_wait_time: string;
        assigned_at: string;
      };
      escalation_context: {
        customer_info: {
          name: string;
          issue_type: string;
          specific_concern: string;
        };
        conversation_summary: {
          issue_identified: string;
          root_cause: string;
          customer_preference: string;
          resolution_attempted: string;
          next_action: string;
        };
        agent_notes: string[];
      };
      handoff_time: string;
      context_transferred: boolean;
      customer_satisfaction_predicted: string;
    };
  };
  isActive: boolean;
}

export const AgentHandoffDisplay: React.FC<AgentHandoffDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const agentConnection = data.agent_connected;

  if (!agentConnection) return null;

  const { agent_details, escalation_context, handoff_time, context_transferred } = agentConnection;

  return (
    <Card className={`p-4 ${isActive ? 'border-primary' : 'border-border'}`}>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className={`font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              Agente Conectado
            </h3>
            {context_transferred && (
              <Badge variant="default">Contexto Transferido</Badge>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Agente: {agent_details.agent_name}</span>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Departamento:</span> {agent_details.department}</p>
              <p><span className="font-medium">Especialización:</span> {agent_details.specialization}</p>
              <p><span className="font-medium">Tiempo estimado:</span> {agent_details.estimated_wait_time}</p>
              <p><span className="font-medium">Asignado:</span> {new Date(agent_details.assigned_at).toLocaleTimeString('es-ES')}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contexto de Escalación
            </h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p><span className="font-medium">Cliente:</span> {escalation_context.customer_info.name}</p>
                <p><span className="font-medium">Tipo de consulta:</span> {escalation_context.customer_info.issue_type}</p>
                <p><span className="font-medium">Preocupación específica:</span> {escalation_context.customer_info.specific_concern}</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium mb-2">Resumen de la conversación:</p>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">Problema identificado:</span> {escalation_context.conversation_summary.issue_identified}</p>
                  <p><span className="font-medium">Causa raíz:</span> {escalation_context.conversation_summary.root_cause}</p>
                  <p><span className="font-medium">Preferencia del cliente:</span> {escalation_context.conversation_summary.customer_preference}</p>
                  <p><span className="font-medium">Resolución intentada:</span> {escalation_context.conversation_summary.resolution_attempted}</p>
                  <p><span className="font-medium">Siguiente acción:</span> {escalation_context.conversation_summary.next_action}</p>
                </div>
              </div>
              
              {escalation_context.agent_notes && escalation_context.agent_notes.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Notas para el agente:</p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    {escalation_context.agent_notes.map((note, index) => (
                      <li key={index} className="text-gray-600">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Transferido: {new Date(handoff_time).toLocaleString('es-ES')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};