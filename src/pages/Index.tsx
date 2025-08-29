import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Settings, ArrowRight, Loader2, Truck, UtensilsCrossed } from "lucide-react";

interface WorkflowDefinition {
  workflow_type: string;
  name: string;
  description: string;
  agent_id: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const { data, error } = await supabase
          .from('workflow_definitions')
          .select('workflow_type, name, description, agent_id')
          .order('name');

        if (error) throw error;
        setWorkflows(data || []);
      } catch (err) {
        console.error('Error loading workflows:', err);
        setError(err instanceof Error ? err.message : 'Error cargando workflows');
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  const getWorkflowIcon = (workflowType: string) => {
    switch (workflowType) {
      case 'booking':
        return <Calendar className="w-8 h-8" />;
      case 'delivery_change':
        return <Truck className="w-8 h-8" />;
      case 'order_management':
        return <UtensilsCrossed className="w-8 h-8" />;
      default:
        return <Settings className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p>Cargando workflows disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Demo Workflow Components</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Componentes reutilizables de gestión de workflows con Supabase realtime
          </p>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No hay workflows disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card 
                key={workflow.workflow_type} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/workflow/${workflow.workflow_type}`)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {getWorkflowIcon(workflow.workflow_type)}
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    <span>{workflow.name}</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {workflow.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      {workflow.workflow_type}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workflow/${workflow.workflow_type}`);
                      }}
                    >
                      Ver Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
