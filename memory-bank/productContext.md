# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.

2025-08-29 11:08:17 - Updated to reflect major architectural changes.

## Project Goal

Create a session-state-sync demonstration project that showcases a real-time workflow management system for a **booking** process. The primary goal is to demonstrate how session state can be synchronized across different components and maintained through browser sessions using a simplified session model and Supabase realtime functionality.

## Key Features

*   **Simplified Session Management** - Sessions are identified by `session_id` + `workflow_type`, with no dependency on email.
*   **Real-time Workflow Visualization** - Live updates of workflow steps using Supabase realtime subscriptions.
*   **Interactive Workflow Simulator** - Buttons to simulate different steps in the booking process.
*   **SMS Confirmation** - Integrated SMS notifications for booking confirmations.
*   **ElevenLabs ConvAI Integration** - Voice AI conversation capabilities with full call lifecycle management.
*   **Responsive UI** - Built with shadcn-ui components and Tailwind CSS for a modern interface.
*   **Multi-step Workflow Process** - Comprehensive booking flow from call start to completion and SMS confirmation.

## Overall Architecture

**Frontend Stack:**
- React 18 with TypeScript
- Vite for build tooling
- shadcn-ui component library
- Tailwind CSS for styling
- React Router for navigation
- Tanstack Query for data management

**Backend Stack:**
- Supabase for database and realtime functionality
- Supabase Edge Functions for API endpoints (e.g., `notify-call-started`, `send-confirmation-sms`)
- PostgreSQL database with realtime subscriptions

**Key Components:**
- WorkflowDemo.tsx - Main demo page with session management
- WorkflowVisualization.tsx - Real-time workflow step display
- WorkflowSimulator.tsx - Interactive step simulation controls
- Supabase client integration for realtime updates

**Workflow Steps:**
## Major Architectural Evolution (2025-09-08)

The project has undergone a significant transformation from a single-workflow demonstration system to a comprehensive multi-workflow platform supporting dynamic configuration and multiple business domains.

### New Multi-Workflow Architecture

**Supported Workflow Types:**
- **booking** - Appointment scheduling and reservation system
- **delivery_change** - Package delivery modification workflows
- **order_management** - Restaurant/pizzeria order processing
- **customer_support** - Technical support and billing assistance

**Database-Driven Configuration:**
- Workflow definitions stored in `workflow_definitions` table
- Dynamic step configuration via JSON `steps_config` field
- Agent IDs linked to ElevenLabs voice agents per workflow
- Runtime configuration loading through `useWorkflowConfig` hook

**Enhanced Step Data Rendering:**
- Intelligent data type detection for 15+ different step data structures
- Specialized display components for each workflow type
- Generic fallback rendering for custom data formats
- Priority-based rendering logic for complex data scenarios

**Workflow Steps (Dynamic):**
Each workflow now defines its own step sequence through database configuration:
1. Dynamic step order based on workflow requirements
2. Actor-based step classification (user, beyond, system)
3. Icon mapping system for visual consistency
4. Simulation message templates for testing

**Key Components (Updated):**
- `WorkflowDemo.tsx` - Enhanced with workflow-specific session management and dynamic agent loading
- `WorkflowVisualization.tsx` - Improved realtime handling with workflow_type filtering and cleanup functions
- `useWorkflowConfig.tsx` - Complete rewrite for database-driven configuration loading
- `StepDataRenderer.tsx` - Expanded to support 15+ data display components
- `Index.tsx` - Dynamic workflow listing from database with icon system

**ElevenLabs Integration (Enhanced):**
- Dynamic variables now include both `session_id` and `workflow_type`
- Agent configuration per workflow type
- Workflow-specific conversation context
- Enhanced error handling and fallback mechanisms

**Session Management (Refined):**
- Workflow-specific localStorage keys: `workflow_${workflowType}_session_id`
- Session persistence across browser sessions
- Automatic session restoration on page load
- Clean session reset functionality

This evolution represents a shift from a demonstration project to a production-ready, extensible workflow management platform capable of supporting multiple business domains through configuration rather than code changes.
1. Waiting → 2. Call Started → 3. Searching Availability → 4. Showing Availability → 5. Confirming Booking → 6. Booking Confirmed → 7. SMS Confirmation Sent -> 8. Call Ended