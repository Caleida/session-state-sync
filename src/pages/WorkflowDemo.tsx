import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WorkflowVisualization } from '@/components/WorkflowVisualization';
import { WorkflowSimulator } from '@/components/WorkflowSimulator';
import { Mail, Play } from 'lucide-react';

const WorkflowDemo = () => {
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Check localStorage for existing session
    const storedSessionId = localStorage.getItem('workflow_session_id');
    const storedEmail = localStorage.getItem('workflow_email');
    
    if (storedSessionId && storedEmail) {
      setSessionId(storedSessionId);
      setEmail(storedEmail);
      setIsStarted(true);
    }
  }, []);

  const startWorkflow = () => {
    if (!email.trim()) return;
    
    const newSessionId = crypto.randomUUID();
    
    // Store in localStorage
    localStorage.setItem('workflow_session_id', newSessionId);
    localStorage.setItem('workflow_email', email);
    
    setSessionId(newSessionId);
    setIsStarted(true);
  };

  const resetSession = () => {
    localStorage.removeItem('workflow_session_id');
    localStorage.removeItem('workflow_email');
    setSessionId(null);
    setEmail('');
    setIsStarted(false);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Mail className="w-6 h-6" />
              <span>Demo Workflow de Citas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Introduce tu email para comenzar:
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && startWorkflow()}
              />
            </div>
            <Button 
              onClick={startWorkflow}
              disabled={!email.trim()}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Demo de Workflow
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Demo Workflow de Gestión de Citas</h1>
          <Button variant="outline" onClick={resetSession}>
            Nueva Sesión
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {sessionId && (
              <WorkflowVisualization sessionId={sessionId} email={email} workflowType="appointments" />
            )}
          </div>
          
          <div className="space-y-4">
            {sessionId && (
              <WorkflowSimulator sessionId={sessionId} email={email} workflowType="appointments" />
            )}
            <div dangerouslySetInnerHTML={{
              __html: `<elevenlabs-convai
                         agent-id="agent_4401k0y50vsbenbrp3h7qr32ghxq"
                         dynamic-variables='{"session_id": "${sessionId}", "email": "${email}"}'
                       ></elevenlabs-convai>`
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDemo;