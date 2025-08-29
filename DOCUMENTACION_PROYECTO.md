# Documentación Exhaustiva del Proyecto: Sistema de Gestión de Workflows Dinámicos

## Índice
1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Estructura de Base de Datos](#estructura-de-base-de-datos)
4. [Creación de Workflows](#creación-de-workflows)
5. [Inyección de Variables Dinámicas ElevenLabs](#inyección-de-variables-dinámicas-elevenlabs)
6. [Páginas Dinámicas basadas en Configuración](#páginas-dinámicas-basadas-en-configuración)
7. [Renderizado Dinámico de Steps](#renderizado-dinámico-de-steps)
8. [Componentes Clave](#componentes-clave)
9. [Edge Functions](#edge-functions)
10. [Flujo de Datos y Estado](#flujo-de-datos-y-estado)
11. [Guía de Desarrollo](#guía-de-desarrollo)
12. [Patrones y Convenciones](#patrones-y-convenciones)
13. [Troubleshooting](#troubleshooting)

---

## Visión General del Proyecto

### Propósito
Este proyecto es un **sistema de gestión de workflows dinámicos** que permite crear, visualizar y simular flujos de trabajo interactivos con integración a ElevenLabs ConvAI para interacciones de voz. El sistema está diseñado para ser completamente configurable, permitiendo crear nuevos tipos de workflows sin modificar código.

### Características Principales
- **Workflows Dinámicos**: Configuración completa de workflows desde base de datos
- **Visualización en Tiempo Real**: Updates en vivo usando Supabase Realtime
- **Integración ElevenLabs**: Agentes de voz con variables dinámicas
- **Simulación Interactiva**: Botones para simular pasos del workflow
- **Persistencia de Sesión**: Mantiene estado a través de localStorage
- **Renderizado Inteligente**: Display components automático basado en estructura de datos

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Edge Functions)
- **Integración Externa**: ElevenLabs ConvAI
- **Estado**: React useState + localStorage
- **Routing**: React Router DOM

---

## Arquitectura General

### Diagrama de Flujo de Datos
```
[ElevenLabs Agent] ←→ [Edge Functions] ←→ [Supabase DB] ←→ [React Frontend]
                                    ↓
                              [Realtime Updates]
                                    ↓
                          [WorkflowVisualization]
```

### Capas de Abstracción
1. **Capa de Presentación**: React Components + UI Components
2. **Capa de Lógica**: Custom Hooks + State Management
3. **Capa de Datos**: Supabase Client + Edge Functions
4. **Capa de Integración**: ElevenLabs ConvAI

---

## Estructura de Base de Datos

### Tabla: `workflow_definitions`
Almacena las configuraciones maestras de cada tipo de workflow.

```sql
CREATE TABLE public.workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    agent_id TEXT,
    steps_config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Estructura del campo `steps_config`:
```json
{
  "steps": {
    "waiting": {
      "id": "waiting",
      "name": "Esperando llamada",
      "description": "El sistema está esperando una llamada entrante",
      "icon": "clock",
      "actor": "system"
    },
    "call_started": {
      "id": "call_started", 
      "name": "Llamada iniciada",
      "description": "La llamada ha sido iniciada por el cliente",
      "icon": "phone",
      "actor": "user"
    }
    // ... más steps
  },
  "step_order": ["waiting", "call_started", "searching_availability", ...],
  "simulation_messages": {
    "call_started": "Iniciando conversación con el cliente...",
    "searching_availability": "Buscando horarios disponibles..."
    // ... más mensajes
  }
}
```

### Tabla: `workflows`
Almacena el estado actual de cada sesión de workflow.

```sql
CREATE TABLE public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    workflow_type TEXT NOT NULL,
    current_step TEXT NOT NULL DEFAULT 'waiting',
    step_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(session_id, workflow_type)
);
```

---

## Creación de Workflows

### Paso 1: Definir la Configuración
Para crear un nuevo workflow, necesitas insertar una nueva fila en `workflow_definitions`:

```sql
INSERT INTO public.workflow_definitions (
    workflow_type,
    name, 
    description,
    agent_id,
    steps_config
) VALUES (
    'mi_nuevo_workflow',
    'Mi Nuevo Workflow',
    'Descripción del workflow',
    'elevenlabs-agent-id-aquí',
    '{
        "steps": {
            "waiting": {
                "id": "waiting",
                "name": "Esperando",
                "description": "Esperando inicio",
                "icon": "clock",
                "actor": "system"
            },
            "step_1": {
                "id": "step_1",
                "name": "Primer Paso",
                "description": "Descripción del primer paso",
                "icon": "phone", 
                "actor": "user"
            },
            "step_2": {
                "id": "step_2",
                "name": "Segundo Paso", 
                "description": "Descripción del segundo paso",
                "icon": "check-circle",
                "actor": "beyond"
            }
        },
        "step_order": ["waiting", "step_1", "step_2"],
        "simulation_messages": {
            "step_1": "Ejecutando primer paso...",
            "step_2": "Completando segundo paso..."
        }
    }'::jsonb
);
```

### Paso 2: Configurar ElevenLabs Agent
El agente de ElevenLabs debe configurarse con:
- **Agent ID**: Identificador único del agente
- **Tools**: Funciones que puede llamar (ver sección Edge Functions)
- **Dynamic Variables**: `{{session_id}}` y `{{workflow_type}}`

### Paso 3: Crear Edge Functions (si necesario)
Si tu workflow necesita lógica específica, crea edge functions que sigan el patrón:

```typescript
// supabase/functions/mi-funcion/index.ts
const { session_id, workflow_type, /* otros parámetros */ } = await req.json();

// Validaciones
if (!session_id || !workflow_type) {
    throw new Error('Parámetros requeridos faltantes');
}

// Lógica específica del workflow
const stepData = {
    // ... datos del paso
};

// Actualizar estado del workflow
const { error } = await supabase
    .from('workflows')
    .upsert({
        session_id,
        workflow_type,
        current_step: 'nuevo_paso',
        step_data: stepData
    });
```

### Paso 4: Crear Display Components (opcional)
Si tu workflow necesita visualización especial de datos, crea componentes en `src/components/step-data/`:

```typescript
// src/components/step-data/MiWorkflowDisplay.tsx
export const MiWorkflowDisplay: React.FC<{data: any, isActive: boolean}> = ({data, isActive}) => {
    return (
        <div className={`mt-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            {/* Tu UI personalizada aquí */}
        </div>
    );
};
```

---

## Inyección de Variables Dinámicas ElevenLabs

### Configuración en el Frontend
En `WorkflowDemo.tsx`, el widget de ElevenLabs se configura con variables dinámicas:

```tsx
<div dangerouslySetInnerHTML={{
    __html: `<elevenlabs-convai
               agent-id="${agentId}"
               dynamic-variables='{"session_id": "${sessionId}", "workflow_type": "${workflowType}"}'
             ></elevenlabs-convai>`
}} />
```

### Variables Disponibles
- **`{{session_id}}`**: UUID único generado para cada sesión
- **`{{workflow_type}}`**: Tipo de workflow actual
- **`{{system__timezone}}`**: Zona horaria del sistema (automática)

### Uso en el Prompt del Agente
```
Eres un agente especializado en {{workflow_type}}.

Tu sesión actual es: {{session_id}}

IMPORTANTE: En TODAS las llamadas a herramientas externas, SIEMPRE incluye:
- session_id con el valor {{session_id}}
- workflow_type con el valor {{workflow_type}}
```

### Ejemplo de Tool Call desde ElevenLabs
Cuando el agente llama a una herramienta, automáticamente incluye las variables:

```json
{
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "workflow_type": "customer_support", 
    "customer_phone": "+1234567890"
}
```

---

## Páginas Dinámicas basadas en Configuración

### Estructura de Routing
El sistema usa un routing dinámico que funciona para cualquier workflow:

```tsx
// src/App.tsx
<Route path="/workflow/:workflowType" element={<WorkflowDemo />} />
```

### Carga Dinámica de Configuración
`WorkflowDemo.tsx` es completamente genérico y se adapta a cualquier workflow:

```tsx
const WorkflowDemo = () => {
    const { workflowType } = useParams<{ workflowType: string }>();
    
    // Hook que carga configuración desde BD
    const { config, agentId, loading, error } = useWorkflowConfig(workflowType || 'booking');
    
    // El resto del componente usa la configuración cargada
    if (!isStarted) {
        return (
            <Card>
                <CardTitle>
                    Demo Workflow: {config.steps[config.stepOrder[0]]?.name || workflowType}
                </CardTitle>
            </Card>
        );
    }
    
    // Renderiza componentes dinámicos
    return (
        <div>
            <WorkflowVisualization sessionId={sessionId} workflowType={workflowType} />
            <WorkflowSimulator sessionId={sessionId} workflowType={workflowType} />
            {/* Widget ElevenLabs con variables dinámicas */}
        </div>
    );
};
```

### Hook `useWorkflowConfig`
Este hook centraliza toda la lógica de carga de configuración:

```tsx
export const useWorkflowConfig = (workflowType: string) => {
    const [config, setConfig] = useState<WorkflowConfig | null>(null);
    const [agentId, setAgentId] = useState<string | null>(null);
    
    useEffect(() => {
        const loadWorkflowConfig = async () => {
            // 1. Carga definición desde BD
            const { data } = await supabase
                .from('workflow_definitions')
                .select('*')
                .eq('workflow_type', workflowType)
                .single();
            
            // 2. Procesa steps_config JSON
            const stepsConfig = data.steps_config;
            const steps = {};
            
            Object.entries(stepsConfig.steps).forEach(([key, step]) => {
                steps[key] = {
                    ...step,
                    icon: iconMap[step.icon] || <Clock className="w-6 h-6" />
                };
            });
            
            // 3. Genera simulateSteps automáticamente
            const simulateSteps = stepsConfig.step_order
                .filter(stepId => stepId !== 'waiting')
                .map(stepId => ({
                    id: stepId,
                    name: steps[stepId].name,
                    icon: iconMap[stepId + '-small'] || steps[stepId].icon,
                    data: { message: stepsConfig.simulation_messages[stepId] }
                }));
            
            // 4. Establece configuración procesada
            setConfig({
                name: data.name,
                description: data.description,
                steps,
                stepOrder: stepsConfig.step_order,
                simulateSteps,
                simulationMessages: stepsConfig.simulation_messages
            });
            
            setAgentId(data.agent_id);
        };
        
        loadWorkflowConfig();
    }, [workflowType]);
    
    return { config, agentId, loading, error };
};
```

### Mapeo de Iconos Dinámico
Los iconos se mapean automáticamente desde strings en la configuración:

```tsx
const iconMap: Record<string, React.ReactNode> = {
    'phone': <Phone className="w-6 h-6" />,
    'calendar': <Calendar className="w-6 h-6" />,
    'check-circle': <CheckCircle className="w-6 h-6" />,
    // ... más iconos
    
    // Versiones pequeñas para simulador
    'phone-small': <Phone className="w-4 h-4" />,
    'calendar-small': <Calendar className="w-4 h-4" />,
    // ...
};
```

---

## Renderizado Dinámico de Steps

### Sistema de Detección Automática
El componente `StepDataRenderer` detecta automáticamente el tipo de datos y renderiza el componente apropiado:

```tsx
export const StepDataRenderer: React.FC<StepDataRendererProps> = ({ 
    stepData, 
    stepId, 
    isActive 
}) => {
    // Retorna null si no hay datos
    if (!stepData || Object.keys(stepData).length === 0) {
        return null;
    }

    // Sistema de detección por prioridad
    
    // 1. Customer support displays (máxima prioridad)
    if (hasCustomerIdentification(stepData)) {
        return <CustomerIdentificationDisplay data={stepData} isActive={isActive} />;
    }
    
    if (hasBillingAnalysis(stepData)) {
        return <BillingAnalysisDisplay data={stepData} isActive={isActive} />;
    }
    
    // 2. Booking workflows
    if (hasAvailableSlots(stepData)) {
        return <AvailableSlotsDisplay data={stepData} isActive={isActive} />;
    }
    
    if (hasConfirmedAppointment(stepData)) {
        return <AppointmentConfirmationDisplay data={stepData} isActive={isActive} />;
    }
    
    // 3. Order management workflows
    if (hasProductCatalog(stepData)) {
        return <ProductCatalogDisplay stepData={stepData} />;
    }
    
    // 4. Generic displays
    if (hasSimpleMessage(stepData)) {
        return (
            <div className={`text-sm mt-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {stepData.message}
            </div>
        );
    }
    
    // Fallback genérico
    if (hasGenericData(stepData)) {
        return <GenericDataDisplay data={stepData} isActive={isActive} />;
    }
    
    return null;
};
```

### Funciones de Detección de Tipo
Cada tipo de datos tiene su función de detección:

```tsx
// Detecta datos de slots disponibles
const hasAvailableSlots = (data: any): boolean => {
    return data && Array.isArray(data.available_slots) && data.available_slots.length > 0;
};

// Detecta confirmación de cita
const hasConfirmedAppointment = (data: any): boolean => {
    return data && (
        data.confirmed_appointment || 
        data.confirmation_number ||
        data.appointment ||
        data.confirmation_details
    );
};

// Detecta identificación de cliente
const hasCustomerIdentification = (data: any): boolean => {
    return data && data.customer_identification && data.customer_identification.customer_info;
};

// Detecta análisis de facturación
const hasBillingAnalysis = (data: any): boolean => {
    return data && data.analyzing_bill && data.analyzing_bill.billing_details;
};
```

### Componentes de Display Especializados
Cada tipo de datos tiene un componente especializado:

```tsx
// CustomerIdentificationDisplay.tsx
export const CustomerIdentificationDisplay: React.FC<{data: any, isActive: boolean}> = ({data, isActive}) => {
    const customerInfo = data.customer_identification?.customer_info;
    
    return (
        <div className={`mt-2 space-y-2 ${isActive ? 'animate-pulse' : ''}`}>
            <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{customerInfo?.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
                <p>📞 {customerInfo?.phone}</p>
                <p>📧 {customerInfo?.email}</p>
                <p>👤 Cliente desde: {customerInfo?.customer_since}</p>
            </div>
        </div>
    );
};
```

### Agregar Nuevos Tipos de Display
Para agregar un nuevo tipo de display:

1. **Crear función de detección**:
```tsx
const hasMiNuevoTipo = (data: any): boolean => {
    return data && data.mi_estructura_especifica;
};
```

2. **Crear componente de display**:
```tsx
// src/components/step-data/MiNuevoTipoDisplay.tsx
export const MiNuevoTipoDisplay: React.FC<{data: any, isActive: boolean}> = ({data, isActive}) => {
    return (
        <div className={`mt-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            {/* Tu renderizado personalizado */}
        </div>
    );
};
```

3. **Agregar al StepDataRenderer**:
```tsx
// Importar el nuevo componente
import { MiNuevoTipoDisplay } from './step-data/MiNuevoTipoDisplay';

// Agregar en el orden correcto de prioridad
if (hasMiNuevoTipo(stepData)) {
    return <MiNuevoTipoDisplay data={stepData} isActive={isActive} />;
}
```

---

## Componentes Clave

### 1. WorkflowVisualization
**Responsabilidad**: Visualizar el progreso del workflow en tiempo real.

**Características**:
- Suscripción Realtime a cambios en BD
- Fallback polling si Realtime falla
- Limpieza automática de datos de pasos futuros
- Estados visuales (completado, activo, pendiente)

**Estados del Componente**:
```tsx
const [currentStep, setCurrentStep] = useState<string>('waiting');
const [stepData, setStepData] = useState<any>({});
const [allStepsData, setAllStepsData] = useState<Record<string, any>>({});
```

### 2. WorkflowSimulator
**Responsabilidad**: Proporcionar botones para simular pasos del workflow.

**Características**:
- Generación automática de botones desde configuración
- Actualización optimista con confirmación
- Botón de reset para reiniciar workflow

### 3. StepDataRenderer
**Responsabilidad**: Detectar tipo de datos y renderizar componente apropiado.

**Patrones de Detección**:
- Prioridad por importancia del workflow
- Detección basada en estructura de datos
- Fallback a display genérico

### 4. useWorkflowConfig Hook
**Responsabilidad**: Centralizar carga y procesamiento de configuración.

**Transformaciones**:
- Convierte JSON de BD a objetos tipados
- Mapea strings de iconos a componentes React
- Genera automáticamente pasos de simulación

---

## Edge Functions

### Patrón Estándar
Todas las edge functions siguen este patrón:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // 1. Manejar CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // 2. Extraer parámetros
        const { session_id, workflow_type, ...otherParams } = await req.json();
        
        // 3. Validaciones
        if (!session_id || !workflow_type) {
            throw new Error('session_id y workflow_type son requeridos');
        }
        
        // 4. Inicializar Supabase
        const supabase = createClient(/* credentials */);
        
        // 5. Lógica específica de la función
        const stepData = {
            // ... datos específicos
        };
        
        // 6. Actualizar workflow
        const { error } = await supabase
            .from('workflows')
            .upsert({
                session_id,
                workflow_type,
                current_step: 'nuevo_paso',
                step_data: stepData
            });
            
        if (error) throw error;
        
        // 7. Respuesta exitosa
        return new Response(JSON.stringify({
            success: true,
            message: 'Operación exitosa',
            data: stepData
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        // 8. Manejo de errores
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
```

### Edge Functions Existentes

#### 1. notify-call-started
- **Propósito**: Notificar inicio de llamada
- **Trigger**: Llamado automáticamente por agente ElevenLabs
- **Acción**: Actualiza workflow a step 'call_started'

#### 2. notify-call-ended
- **Propósito**: Notificar fin de llamada
- **Trigger**: Llamado por agente cuando termina conversación
- **Acción**: Actualiza workflow a step 'call_ended'

#### 3. get-customer-info
- **Propósito**: Identificar cliente por teléfono
- **Datos**: Información completa del cliente
- **Display**: CustomerIdentificationDisplay

#### 4. get-billing-details
- **Propósito**: Obtener detalles de facturación
- **Datos**: Servicios activos y cargos
- **Display**: BillingAnalysisDisplay

#### 5. explain-charges
- **Propósito**: Explicar cargos específicos
- **Datos**: Detalles de incrementos y cambios
- **Display**: BillingAnalysisDisplay (ampliado)

#### 6. get-promotions
- **Propósito**: Obtener promociones disponibles
- **Datos**: Lista de ofertas personalizadas  
- **Display**: PromotionsDisplay

#### 7. escalate-to-agent
- **Propósito**: Escalar a agente humano
- **Datos**: Información de transferencia
- **Display**: AgentHandoffDisplay

---

## Flujo de Datos y Estado

### 1. Inicialización de Sesión
```
Usuario accede → /workflow/customer_support
                        ↓
WorkflowDemo → useWorkflowConfig → Supabase BD
                        ↓
Configuración cargada → startWorkflow()
                        ↓  
sessionId generado → localStorage
                        ↓
Componentes inicializados
```

### 2. Interacción con ElevenLabs
```
Widget ElevenLabs → dynamic-variables → Agente
                                          ↓
Agente llama tool → Edge Function → Supabase BD
                                          ↓
BD actualizada → Realtime → WorkflowVisualization
                                          ↓
UI actualizada → StepDataRenderer → Display Component
```

### 3. Simulación Manual
```
Usuario click botón → WorkflowSimulator.updateWorkflowStep()
                                          ↓
Supabase.upsert() → workflows table → Realtime
                                          ↓
WorkflowVisualization → estado actualizado
```

### Gestión de Estado Reactivo
```tsx
// En WorkflowVisualization
useEffect(() => {
    // 1. Carga inicial manual
    const loadCurrentState = async () => {
        const { data } = await supabase
            .from('workflows')
            .select('current_step, step_data')
            .eq('session_id', sessionId)
            .maybeSingle();
            
        if (data) {
            setCurrentStep(data.current_step);
            setStepData(data.step_data || {});
            setAllStepsData(prev => ({
                ...prev, 
                [data.current_step]: data.step_data
            }));
        }
    };
    
    // 2. Suscripción Realtime
    const channel = supabase
        .channel('workflows')
        .on('postgres_changes', {
            event: '*',
            schema: 'public', 
            table: 'workflows',
            filter: `session_id=eq.${sessionId}`
        }, (payload) => {
            const newData = payload.new;
            setCurrentStep(newData.current_step);
            setStepData(newData.step_data || {});
            setAllStepsData(prev => ({
                ...prev,
                [newData.current_step]: newData.step_data
            }));
        })
        .subscribe();
        
    // 3. Fallback polling
    const pollInterval = setInterval(loadCurrentState, 3000);
    
    return () => {
        supabase.removeChannel(channel);
        clearInterval(pollInterval);
    };
}, [sessionId, workflowType]);
```

---

## Guía de Desarrollo

### Crear un Nuevo Workflow

#### 1. Preparación
```bash
# 1. Crear entrada en BD (puedes usar SQL directo o migración)
# 2. Configurar agente ElevenLabs con tools necesarias
# 3. Determinar si necesitas edge functions específicas
# 4. Determinar si necesitas display components personalizados
```

#### 2. Insertar Configuración
```sql
INSERT INTO public.workflow_definitions (
    workflow_type,
    name,
    description, 
    agent_id,
    steps_config
) VALUES (
    'mi_workflow',
    'Mi Workflow Personalizado',
    'Descripción detallada del workflow',
    'elevenlabs-agent-id-123',
    '{
        "steps": {
            "waiting": {
                "id": "waiting",
                "name": "Esperando Inicio",
                "description": "Sistema esperando interacción",
                "icon": "clock",
                "actor": "system"
            },
            "paso_1": {
                "id": "paso_1", 
                "name": "Paso Inicial",
                "description": "Primer paso del proceso",
                "icon": "phone",
                "actor": "user"
            },
            "paso_2": {
                "id": "paso_2",
                "name": "Procesamiento", 
                "description": "Procesando información",
                "icon": "search",
                "actor": "beyond"
            },
            "completado": {
                "id": "completado",
                "name": "Completado",
                "description": "Proceso finalizado exitosamente", 
                "icon": "check-circle",
                "actor": "system"
            }
        },
        "step_order": ["waiting", "paso_1", "paso_2", "completado"],
        "simulation_messages": {
            "paso_1": "Iniciando proceso personalizado...",
            "paso_2": "Procesando información del cliente...", 
            "completado": "Proceso completado exitosamente"
        }
    }'::jsonb
);
```

#### 3. Crear Edge Functions (si necesario)
```typescript
// supabase/functions/mi-workflow-action/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { session_id, workflow_type, custom_param } = await req.json();
        
        if (!session_id || !workflow_type) {
            throw new Error('Parámetros requeridos faltantes');
        }

        const supabase = createClient(
            "https://uoskbpqmlvgrwoqosnew.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2ticHFtbHZncndvcW9zbmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDgzMDgsImV4cCI6MjA2ODkyNDMwOH0.iyK012ElyB_SHOczPRbQcUbon0oV6yYqXs6htmuKv2M"
        );

        // Tu lógica específica aquí
        const stepData = {
            procesado: true,
            timestamp: new Date().toISOString(),
            custom_param
        };

        const { error } = await supabase
            .from('workflows')
            .upsert({
                session_id,
                workflow_type,
                current_step: 'paso_2',
                step_data: stepData
            });

        if (error) throw error;

        return new Response(JSON.stringify({
            success: true,
            message: 'Acción ejecutada exitosamente',
            data: stepData
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
```

#### 4. Crear Display Components (si necesario)
```tsx
// src/components/step-data/MiWorkflowDisplay.tsx
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface MiWorkflowDisplayProps {
    data: any;
    isActive: boolean;
}

export const MiWorkflowDisplay: React.FC<MiWorkflowDisplayProps> = ({ data, isActive }) => {
    if (!data || !data.procesado) return null;

    return (
        <div className={`mt-2 p-3 rounded-lg border ${
            isActive ? 'border-primary bg-primary/5 animate-pulse' : 'border-muted bg-muted/50'
        }`}>
            <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Procesamiento Completado</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
                <p>Procesado: {data.timestamp}</p>
                {data.custom_param && <p>Parámetro: {data.custom_param}</p>}
            </div>
        </div>
    );
};
```

#### 5. Integrar Display Component
```tsx
// src/components/StepDataRenderer.tsx

// 1. Importar el nuevo componente
import { MiWorkflowDisplay } from './step-data/MiWorkflowDisplay';

// 2. Crear función de detección
const hasMiWorkflowData = (data: any): boolean => {
    return data && data.procesado === true;
};

// 3. Agregar al renderizador (en orden de prioridad)
export const StepDataRenderer: React.FC<StepDataRendererProps> = ({ stepData, stepId, isActive }) => {
    // ... otras detecciones
    
    if (hasMiWorkflowData(stepData)) {
        return <MiWorkflowDisplay data={stepData} isActive={isActive} />;
    }
    
    // ... resto de detecciones
};
```

#### 6. Actualizar supabase/config.toml
```toml
[functions.mi-workflow-action]
verify_jwt = false
```

#### 7. Configurar Agente ElevenLabs
En el dashboard de ElevenLabs:
- **Agent ID**: Copiar del dashboard
- **Tools**: Agregar `mi_workflow_action` con parámetros apropiados
- **Prompt**: Incluir variables dinámicas `{{session_id}}` y `{{workflow_type}}`

#### 8. Probar el Workflow
1. Navegar a `/workflow/mi_workflow`
2. Iniciar sesión
3. Probar simulación manual
4. Probar integración con ElevenLabs

### Debugging

#### 1. Problemas de Configuración
```javascript
// En el navegador, inspeccionar configuración cargada
console.log('Config:', config);
console.log('Agent ID:', agentId);
console.log('Steps:', config?.steps);
console.log('Step Order:', config?.stepOrder);
```

#### 2. Problemas de Estado
```javascript
// En WorkflowVisualization
console.log('Current Step:', currentStep);
console.log('Step Data:', stepData);
console.log('All Steps Data:', allStepsData);
```

#### 3. Problemas de Realtime
```javascript
// Verificar conexión Realtime
const channel = supabase.channel('test')
    .on('postgres_changes', { /* config */ }, (payload) => {
        console.log('Realtime working:', payload);
    })
    .subscribe((status) => {
        console.log('Subscription status:', status);
    });
```

#### 4. Problemas de Edge Functions
```bash
# Ver logs en dashboard Supabase
# O usar console.log en la función
console.log('Function called with:', { session_id, workflow_type });
```

---

## Patrones y Convenciones

### Naming Conventions
- **Workflow Types**: snake_case (ej: `customer_support`, `order_management`)
- **Step IDs**: snake_case (ej: `call_started`, `searching_availability`)
- **Edge Functions**: kebab-case (ej: `get-customer-info`, `notify-call-started`)
- **React Components**: PascalCase (ej: `WorkflowVisualization`, `StepDataRenderer`)

### File Structure
```
src/
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── step-data/              # Display components específicos
│   ├── WorkflowVisualization.tsx
│   ├── WorkflowSimulator.tsx
│   └── StepDataRenderer.tsx
├── hooks/
│   └── useWorkflowConfig.tsx   # Hook principal de configuración
├── pages/
│   ├── Index.tsx               # Lista de workflows
│   ├── WorkflowDemo.tsx        # Demo dinámico
│   └── NotFound.tsx
└── integrations/supabase/
    └── client.ts               # Cliente Supabase

supabase/
├── functions/                  # Edge Functions
│   ├── notify-call-started/
│   ├── get-customer-info/
│   └── [workflow-function]/
└── migrations/                 # Migraciones BD
```

### Error Handling Patterns
```tsx
// 1. En componentes React
if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} />;
if (!data) return <EmptyState />;

// 2. En Edge Functions
try {
    // ... lógica
} catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
        success: false,
        error: error.message
    }), { status: 500, headers: corsHeaders });
}

// 3. En hooks
const [error, setError] = useState<string | null>(null);
try {
    // ... operación
} catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
}
```

### State Management Patterns
```tsx
// 1. Estado local con React
const [currentStep, setCurrentStep] = useState<string>('waiting');
const [stepData, setStepData] = useState<any>({});

// 2. Persistencia en localStorage
localStorage.setItem(`workflow_${workflowType}_session_id`, sessionId);
const storedSessionId = localStorage.getItem(`workflow_${workflowType}_session_id`);

// 3. Estado compartido vía Supabase Realtime
const channel = supabase.channel('workflows')
    .on('postgres_changes', { /* config */ }, handleChange)
    .subscribe();
```

---

## Troubleshooting

### Problemas Comunes

#### 1. "Configuración no encontrada"
```sql
-- Verificar que existe el workflow_type
SELECT * FROM workflow_definitions WHERE workflow_type = 'mi_workflow';

-- Verificar estructura de steps_config
SELECT steps_config FROM workflow_definitions WHERE workflow_type = 'mi_workflow';
```

#### 2. "Realtime no funciona"
```javascript
// Verificar estado de suscripción
channel.subscribe((status) => {
    console.log('Status:', status);
    if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime connected');
    } else {
        console.log('❌ Realtime failed, using polling');
    }
});
```

#### 3. "Edge Function error 500"
```javascript
// En la Edge Function, agregar más logging
console.log('Request body:', await req.json());
console.log('Supabase client initialized');
console.log('Database operation result:', result);
```

#### 4. "Widget ElevenLabs no carga"
```html
<!-- Verificar que el script está cargado -->
<script src="https://elevenlabs.io/convai-widget/index.js" async></script>

<!-- Verificar variables dinámicas -->
dynamic-variables='{"session_id": "valid-uuid", "workflow_type": "valid-type"}'
```

#### 5. "Step data no se renderiza"
```tsx
// Verificar función de detección
console.log('Step data:', stepData);
console.log('Detection result:', hasMiTipoData(stepData));

// Verificar orden en StepDataRenderer
// Las detecciones más específicas deben ir primero
```

### Logs Útiles

#### Frontend (React)
```javascript
// En WorkflowVisualization
console.log('🔄 Estado cargado:', { currentStep, stepData });
console.log('📡 Cambio realtime recibido:', payload);
console.log('✅ Realtime conectado');
```

#### Backend (Edge Functions)
```javascript
console.log('Function called with:', { session_id, workflow_type });
console.log('Database query result:', data);
console.log('Error occurred:', error.message);
```

#### Base de Datos
```sql
-- Ver workflows activos
SELECT session_id, workflow_type, current_step, updated_at 
FROM workflows 
ORDER BY updated_at DESC 
LIMIT 10;

-- Ver configuraciones disponibles
SELECT workflow_type, name, agent_id 
FROM workflow_definitions;
```

### Performance Tips

#### 1. Optimizar Realtime
- Usar filtros específicos en suscripciones
- Implementar cleanup adecuado
- Usar polling como fallback, no como primary

#### 2. Optimizar Edge Functions
- Validar parámetros temprano
- Usar logging apropiado
- Implementar timeouts

#### 3. Optimizar React
- Usar useCallback para funciones estables
- Implementar cleanup en useEffect
- Evitar re-renders innecesarios

---

## Conclusión

Este proyecto implementa un sistema altamente flexible y escalable para gestionar workflows dinámicos. La arquitectura modular permite:

1. **Extensibilidad**: Agregar nuevos workflows sin tocar código existente
2. **Reutilización**: Componentes genéricos que funcionan con cualquier workflow
3. **Mantenibilidad**: Separación clara de responsabilidades
4. **Escalabilidad**: Basado en Supabase para manejar múltiples sesiones concurrentes

La clave del sistema está en la configuración JSON en `workflow_definitions` que define completamente el comportamiento de cada workflow, permitiendo al sistema ser verdaderamente "data-driven".

Para cualquier duda o necesidad de extensión, consulta esta documentación y sigue los patrones establecidos para mantener la consistencia del sistema.