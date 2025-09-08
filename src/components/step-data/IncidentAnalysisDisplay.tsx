import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, GitBranch, Clock, UserPlus, CheckCircle } from "lucide-react";

interface IncidentAnalysisDisplayProps {
  data: {
    incident_analysis?: {
      issue_type: string;
      severity: string;
      classification: string;
      priority: string;
      recommended_action: string;
      analysis_timestamp: string;
      routing_decision: {
        action: string;
        reason: string;
        department: string;
        estimated_resolution_time: string;
      };
      context_for_agent: {
        customer_identified: boolean;
        package_located: boolean;
        incident_type: string;
        urgency_level: string;
        required_actions: string[];
      };
    };
    routing_timestamp?: string;
    next_action?: string;
  };
  isActive: boolean;
}

export const IncidentAnalysisDisplay: React.FC<IncidentAnalysisDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const incidentData = data.incident_analysis;
  
  if (!incidentData) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': case 'critical': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'immediate_escalation': return 'destructive';
      case 'urgent': return 'default';
      case 'normal': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card className={`${isActive ? 'border-primary' : 'border-border'} transition-colors`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Análisis de Incidencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Tipo de Incidencia
            </div>
            <div className="text-sm">{incidentData.context_for_agent.incident_type}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Severidad
            </div>
            <Badge variant={getSeverityColor(incidentData.severity)}>
              {incidentData.severity.toUpperCase()}
            </Badge>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Clasificación
            </div>
            <div className="text-sm">{incidentData.classification}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Prioridad
            </div>
            <Badge variant={getPriorityColor(incidentData.priority)}>
              {incidentData.priority}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Decisión de Enrutamiento</span>
          </div>
          <div className="space-y-2 ml-6">
            <div className="flex items-center gap-2">
              <UserPlus className="h-3 w-3" />
              <span className="text-sm">{incidentData.routing_decision.reason}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className="text-sm">
                Tiempo estimado: {incidentData.routing_decision.estimated_resolution_time}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="font-medium">Contexto para Agente</span>
          </div>
          <div className="space-y-2 ml-6">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  incidentData.context_for_agent.customer_identified ? 'bg-green-500' : 'bg-red-500'
                }`} />
                Cliente identificado
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  incidentData.context_for_agent.package_located ? 'bg-green-500' : 'bg-red-500'
                }`} />
                Paquete localizado
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Urgencia:</span> {incidentData.context_for_agent.urgency_level}
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Acciones Requeridas:</div>
              <ul className="text-xs space-y-1 ml-2">
                {incidentData.context_for_agent.required_actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-muted-foreground">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {data.routing_timestamp && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Análisis completado: {new Date(data.routing_timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};