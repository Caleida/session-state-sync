# System Patterns

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.

2025-08-27 14:23:00 - Initial Memory Bank creation and project analysis completed.

## Coding Patterns

**React Component Structure**
- Functional components with TypeScript interfaces for props
- Custom hooks for logic separation (useToast)
- Props destructuring with TypeScript typing
- Event handlers defined as arrow functions

**State Management Pattern**
- React useState for local component state
- useEffect for side effects and subscriptions
- localStorage for session persistence
- Supabase realtime subscriptions for live data

**Import Organization**
- External libraries first (React, UI components)
- Internal components second (@/components/*)
- Hooks and utilities third (@/hooks/*, @/lib/*)
- Icons and assets last (lucide-react)

## Architectural Patterns

**Component Composition Pattern**
- Page components (WorkflowDemo.tsx) act as containers
- Feature components (WorkflowVisualization, WorkflowSimulator) handle specific functionality
- UI components from shadcn-ui for consistent interface elements
- Clear separation of concerns between display and logic

**Real-time Subscription Pattern**
- Supabase channel subscription in useEffect
- Cleanup function to remove subscriptions on unmount
- State updates triggered by realtime database changes
- Error handling for subscription failures

**Session State Pattern**
- UUID generation for unique session identification
- localStorage for session persistence across browser sessions
- Session restoration on component mount
- Clear session cleanup functionality

**API Integration Pattern**
- Supabase client wrapper in dedicated integration folder
- Edge Functions for external API calls (BEYOND Citas simulation)
- Error handling with toast notifications
- Optimistic UI updates with rollback on failure

## Testing Patterns

**Component Testing Structure** (Not implemented but recommended)
- Unit tests for individual components
- Integration tests for workflow state changes
- End-to-end tests for complete user flows
- Mock Supabase client for isolated testing

**Error Handling Pattern**
- Try-catch blocks for async operations
- Toast notifications for user feedback
- Console logging for development debugging
- Graceful degradation for failed real-time connections
---
## Architectural Patterns (Updated 2025-08-29)

**Simplified Session State Pattern (No Email)**
- Session identification relies on a composite key: `session_id` + `workflow_type`.
- `email` has been completely removed from the session context, promoting privacy and flexibility.
- The workflow type (e.g., "booking") is now a mandatory part of the session, allowing for multiple distinct workflows.
- This pattern simplifies the data model and decouples the session from user-specific PII.

**SMS Confirmation Pattern**
- A dedicated Edge Function (`send-confirmation-sms`) handles the delivery of SMS messages.
- The workflow state machine includes a distinct step for "sms-confirmation-sent" and "sms-confirmed".
- Database schema is extended to log SMS delivery status and user responses (if any).
- This pattern creates a verifiable and secure channel for critical notifications.

**Enhanced Edge Function Pattern for Call Lifecycle**
- The call lifecycle is managed by a trio of dedicated Edge Functions:
  - `notify-call-started`: Triggered at the beginning of a call to initialize the workflow.
  - `notify-call-ended`: Triggered at the end of a call to finalize the workflow and log metadata.
  - `send-confirmation-sms`: Triggered after a successful booking to send an SMS.
- This pattern ensures a clear separation of concerns, where each function has a single responsibility.
## Database-Driven Configuration Pattern (2025-09-08)

**Workflow Definitions Table Pattern**
- Centralized workflow configuration in `workflow_definitions` table
- JSON-based step configuration with `steps_config` field
- Agent ID mapping for ElevenLabs integration per workflow
- Dynamic loading through `useWorkflowConfig` hook
- Eliminates hardcoded workflow logic in favor of data-driven approach

**Multi-Workflow Session Management Pattern**
- Workflow-specific localStorage keys: `workflow_${workflowType}_session_id`
- Session isolation between different workflow types
- Automatic session restoration on workflow-specific routes
- Clean separation of session state across business domains

**Dynamic Step Rendering Pattern**
- Intelligent data type detection in `StepDataRenderer`
- Priority-based component selection for complex data structures
- Support for 15+ specialized display components
- Generic fallback rendering for unknown data formats
- Extensible architecture for new workflow types

**Enhanced Realtime Subscription Pattern (Updated)**
- Workflow-type filtering in database queries: `eq('workflow_type', workflowType)`
- Improved error handling with fallback polling mechanism
- Automatic cleanup of future steps when moving backwards in workflow
- Enhanced subscription lifecycle management with timeout fallbacks

**Icon Mapping and Theming Pattern**
- Centralized icon mapping system in `useWorkflowConfig`
- Size variants for different UI contexts (normal, small)
- Consistent visual language across workflow types
- Extensible icon library for new workflow scenarios

**Agent Integration Pattern (Enhanced)**
- Dynamic variable passing: `session_id` and `workflow_type` to ElevenLabs
- Agent-specific configuration per workflow type
- Workflow context preservation in voice conversations
- Enhanced error handling for agent communication failures

This evolution represents a fundamental shift from monolithic, hardcoded workflows to a flexible, configuration-driven architecture that can easily accommodate new business domains and workflow types through database changes rather than code modifications.
- It provides robust, end-to-end tracking of the voice agent interaction.