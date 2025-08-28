import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { WorkflowVisualization } from '@/components/WorkflowVisualization';
import { WorkflowSimulator } from '@/components/WorkflowSimulator';
import { useWorkflowConfig } from '@/hooks/useWorkflowConfig';
import { Play, ArrowLeft, Home } from 'lucide-react';

const WorkflowDemo = () => {
  const { workflowType } = useParams<{ workflowType: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  
  const { config, agentId, loading: configLoading, error: configError } = useWorkflowConfig(workflowType || 'booking');

  // Redirect if no workflowType
  useEffect(() => {
    if (!workflowType) {
      navigate('/');
      return;
    }
  }, [workflowType, navigate]);

  useEffect(() => {
    if (!workflowType) return;
    
    // Check localStorage for existing session
    const storageKey = `workflow_${workflowType}_session_id`;
    
    const storedSessionId = localStorage.getItem(storageKey);
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
      setIsStarted(true);
    }
  }, [workflowType]);

  const startWorkflow = () => {
    if (!workflowType) return;
    
    const newSessionId = crypto.randomUUID();
    
    // Store in localStorage with workflow-specific key
    const storageKey = `workflow_${workflowType}_session_id`;
    
    localStorage.setItem(storageKey, newSessionId);
    
    setSessionId(newSessionId);
    setIsStarted(true);
  };

  const resetSession = () => {
    if (!workflowType) return;
    
    const storageKey = `workflow_${workflowType}_session_id`;
    
    localStorage.removeItem(storageKey);
    setSessionId(null);
    setIsStarted(false);
  };

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Cargando configuración del workflow...</p>
      </div>
    );
  }

  if (configError || !config || !workflowType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-red-500">Error: {configError || 'Workflow no encontrado'}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Play className="w-6 h-6" />
              <span>Demo Workflow: {config.workflowSteps[config.stepOrder[0]]?.name || workflowType}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                ¡Listo para comenzar el demo del workflow!
              </p>
              <Button 
                onClick={startWorkflow}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Demo de Workflow
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Workflows</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {config?.name || workflowType}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button variant="outline" onClick={resetSession}>
              Nueva Sesión
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {sessionId && (
              <WorkflowVisualization sessionId={sessionId} workflowType={workflowType} />
            )}
          </div>
          
          <div className="space-y-4">
            {sessionId && (
              <WorkflowSimulator sessionId={sessionId} workflowType={workflowType} />
            )}
            {agentId && (
              <div dangerouslySetInnerHTML={{
                __html: `<elevenlabs-convai
                           agent-id="${agentId}"
                           dynamic-variables='{"session_id": "${sessionId}"}'
                         ></elevenlabs-convai>`
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDemo;