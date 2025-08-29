import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Headphones, User, Clock, MessageCircle, Phone } from 'lucide-react';

interface AgentHandoffDisplayProps {
  data: {
    agent_connection?: {
      agent_info: {
        agent_id: string;
        name: string;
        department: string;
        specialization: string[];
        experience_level: string;
        languages: string[];
        status: string;
      };
      escalation_context: {
        customer_name: string;
        issue_type: string;
        priority_level: string;
        conversation_summary: string;
        suggested_actions: string[];
        relevant_history: string;
        customer_sentiment: string;
      };
      connection_details: {
        connected_at: string;
        estimated_wait_time: string;
        connection_method: string;
      };
    };
  };
  isActive: boolean;
}

export const AgentHandoffDisplay: React.FC<AgentHandoffDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const agentConnection = data.agent_connection;

  if (!agentConnection) return null;

  const { agent_info, escalation_context, connection_details } = agentConnection;

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className={`space-y-3 text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
          <div className="flex items-center space-x-2">
            <Headphones className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Conectado con agente</span>
            <Badge variant="default" className="text-xs">
              {agent_info.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3 text-blue-600" />
                <span className="font-medium text-blue-700">{agent_info.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {agent_info.department}
              </Badge>
            </div>
            
            <div className="text-xs text-blue-600">
              Especialista en: {agent_info.specialization.join(', ')}
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Clock className="w-3 h-3" />
              <span>Conectado: {connection_details.connected_at}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium">Contexto del caso:</div>
            
            <div className="p-2 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Cliente: {escalation_context.customer_name}</span>
                <Badge 
                  variant={escalation_context.priority_level === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {escalation_context.priority_level}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                Tipo: {escalation_context.issue_type}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <strong>Resumen:</strong> {escalation_context.conversation_summary}
              </div>
            </div>

            {escalation_context.suggested_actions && escalation_context.suggested_actions.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-1">Acciones sugeridas:</div>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                  {escalation_context.suggested_actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {escalation_context.customer_sentiment && (
              <div className="flex items-center space-x-1 text-xs">
                <MessageCircle className="w-3 h-3" />
                <span>Sentimiento: </span>
                <Badge 
                  variant={escalation_context.customer_sentiment === 'frustrated' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {escalation_context.customer_sentiment}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};