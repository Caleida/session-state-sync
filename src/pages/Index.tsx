import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Phone, 
  Bot, 
  Loader2, 
  Truck, 
  UtensilsCrossed, 
  Headphones, 
  AlertTriangle,
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

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
    const icons: Record<string, any> = {
      'booking': Clock,
      'delivery_change': Truck,
      'order_management': UtensilsCrossed,
      'customer_support': Headphones,
      'package_incident': AlertTriangle,
      'customer_service': MessageSquare,
      'appointment_booking': Clock,
      'technical_support': Bot,
      'sales_inquiry': TrendingUp,
      'billing_support': Shield,
      'general_inquiry': Zap,
    };
    
    return icons[workflowType] || Phone;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando workflows disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error: {error}</p>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => {
              const IconComponent = getWorkflowIcon(workflow.workflow_type);
              
              return (
                <Card 
                  key={workflow.workflow_type} 
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-card/50 backdrop-blur-sm border-border/50"
                  onClick={() => navigate(`/workflow/${workflow.workflow_type}`)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {workflow.workflow_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {workflow.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-muted-foreground">
                      {workflow.description}
                    </CardDescription>
                    <Button 
                      className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border-primary/20"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workflow/${workflow.workflow_type}`);
                      }}
                    >
                      Ver Demo
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
