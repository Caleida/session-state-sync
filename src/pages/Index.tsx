import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Demo Workflow Component</h1>
        <p className="text-xl text-muted-foreground">Componente reutilizable de gestión de citas con Supabase realtime</p>
        <Button onClick={() => navigate('/workflow')} size="lg">
          Ver Demo del Workflow
        </Button>
      </div>
    </div>
  );
};

export default Index;
