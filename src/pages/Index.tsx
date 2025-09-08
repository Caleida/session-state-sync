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
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Beyond IVR:
                <br />
                <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
                  Revoluciona tu atención telefónica
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Reemplaza tu IVR rígido por una experiencia de IA conversacional 24/7 y dispara la satisfacción de tus clientes
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">+25%</div>
                <div className="text-sm text-muted-foreground">NPS mejorado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">-90%</div>
                <div className="text-sm text-muted-foreground">Tiempo espera</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Disponibilidad</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <Bot className="mr-2 h-5 w-5" />
                Habla con nuestra IA
              </Button>
              <Button variant="outline" size="lg" className="border-primary/20 text-foreground hover:bg-primary/10">
                Contáctanos
              </Button>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center">
            <div className="relative">
              <div className="w-80 h-[600px] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[3rem] p-4 backdrop-blur-sm border border-primary/20">
                <div className="w-full h-full bg-card rounded-[2.5rem] p-6 flex flex-col items-center justify-center space-y-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">beyond</div>
                    <div className="text-sm text-muted-foreground">04:21</div>
                  </div>
                  
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground mb-2">Asistente IA</div>
                    <div className="text-sm text-muted-foreground">Conectando...</div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Descubre nuestros flujos de trabajo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experimenta cómo nuestra IA puede transformar la atención al cliente en diferentes escenarios
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
