# Decision Log

This file records architectural and implementation decisions using a list format.

2025-08-27 14:23:00 - Initial Memory Bank creation and project analysis completed.

## Decision

**React + TypeScript + Vite Frontend Stack**
- React 18 with TypeScript for type safety and modern React features
- Vite for fast development and optimized builds
- shadcn-ui component library for consistent, accessible UI components
- Tailwind CSS for utility-first styling approach

## Rationale

- Modern development experience with hot module replacement
- Type safety reduces runtime errors and improves developer experience
- shadcn-ui provides pre-built, accessible components following design system principles
- Tailwind enables rapid prototyping and consistent design implementation

## Implementation Details

- Project configured with TypeScript strict mode
- Components organized in src/components/ with ui/ subdirectory for reusable components
- Pages organized in src/pages/ for different route components
- Integration setup in src/integrations/ for external services

---

## Decision

**Supabase for Backend Infrastructure**
- Supabase PostgreSQL database for data persistence
- Supabase realtime subscriptions for live workflow updates
- Supabase Edge Functions for API endpoints

## Rationale

- Provides complete backend infrastructure without server management
- Real-time capabilities essential for workflow state synchronization
- Edge Functions enable custom API logic close to users
- PostgreSQL offers robust data consistency and querying capabilities

## Implementation Details

- Supabase client configured in src/integrations/supabase/client.ts
- Database schema includes workflows table for session state tracking
- Real-time subscriptions implemented in WorkflowVisualization component
- Edge Functions deployed for search-availability and confirm-appointment endpoints

---

## Decision

**localStorage for Session Persistence**
- Browser localStorage used to maintain workflow sessions across page refreshes
- Session ID and email stored locally for continuity

## Rationale

- Enables demonstration of session state persistence without requiring user authentication
- Simple implementation suitable for demo/prototype purposes
- Maintains workflow state even if user navigates away and returns

## Implementation Details

- Session data stored with keys: 'workflow_session_id' and 'workflow_email'
- Session restoration implemented in WorkflowDemo component useEffect
- Cleanup functionality provided through resetSession function

---

## Decision

**Simplified ElevenLabs Session Integration**
- Changed from complex WebSocket interception to direct session_id passing
- Pass React-generated session_id as widget attribute instead of capturing conversation_id
- Maintain web application control over session management

## Rationale

- Original WebSocket interception approach was overly complex and difficult to maintain
- Direct session_id passing provides simpler, more reliable integration
- Keeps session management logic centralized in React application
- Eliminates need for complex WebSocket proxying and message parsing
- Better aligns with standard web component integration patterns

## Implementation Details

- Modified WorkflowDemo.tsx to pass sessionId as session-id attribute to elevenlabs-convai widget
- Added session_id display in UI for transparency
- Maintained existing localStorage persistence and session management
- ElevenLabs agent can now receive and use the React-generated session_id for API calls

[2025-08-27 14:56:30] - Simplified ElevenLabs integration approach implemented

[2025-08-27 14:59:10] - Removed unnecessary @elevenlabs/react dependency 
- Eliminated "@elevenlabs/react": "^0.5.1" from package.json dependencies
- Since implementation uses direct HTML widget via dangerouslySetInnerHTML, React SDK is redundant
- Reduces bundle size and simplifies dependency management
- Maintains clean, lightweight integration approach

---

## Decision

**Database Schema Enhancement: UNIQUE Constraint on session_id**
- Added UNIQUE constraint on session_id column in workflows table
- Migration 20250827165300_add_unique_session_id_constraint.sql created and applied
- Prevents duplicate workflow records for same session

## Rationale

- Root cause analysis revealed PGRST116 error was caused by multiple workflow records with same session_id
- Supabase .upsert() operations only update records on PRIMARY KEY or UNIQUE constraint conflicts
- Without UNIQUE constraint, .upsert() was creating duplicates instead of updating existing records
- .maybeSingle() queries failed when encountering multiple rows for same session_id
- Database integrity required enforcing one-to-one relationship between sessions and workflow records

## Implementation Details

- Migration removes existing duplicate records using SQL deletion with row numbering
- UNIQUE constraint `unique_session_id` added to prevent future duplicates  
- .upsert() operations now correctly update existing workflow records instead of creating new ones
- All PostgREST queries expecting single results (.maybeSingle()) now work reliably
- Frontend code reverted from temporary workarounds to optimal implementation

[2025-08-27 17:11:00] - Database schema enhancement completed successfully

---

## Decision

**Agent-Based Call Termination Detection for ElevenLabs Integration**
- Implemented automatic call termination detection using ElevenLabs agent tools
- Created `end-call` Edge Function to handle workflow state transitions
- Agent calls tool when conversation concludes naturally

## Rationale

- ElevenLabs post-call webhooks do NOT include dynamic variables (session_id, email)
- Widget DOM monitoring would be unreliable and hacky
- React SDK integration would require major refactoring and defeat the purpose of using the simple widget
- Agent-based approach provides reliable, controlled termination detection
- Maintains consistency with existing Edge Function architecture

## Implementation Details

- Created `supabase/functions/end-call/index.ts` following same pattern as existing functions
- Edge Function receives session_id, email, call_duration, termination_reason, call_summary
- Updates workflows table with current_step: 'call_ended' and termination metadata
- Agent configured with `end_call` tool that accesses dynamic variables
- Tool called automatically when conversation concludes naturally

[2025-08-27 18:29:00] - Agent-based call termination detection implemented successfully
---

## Decision

**Simplified Session Identification (Email Dependency Removal)**
- Removed `email` as a dependency for identifying user sessions.
- Sessions are now uniquely identified by a composite key: `session_id` + `workflow_type`.
- Rebranded "appointments" workflow to "booking" for better clarity.

## Rationale

- The previous `(session_id, email)` model was too restrictive and created unnecessary data coupling.
- Removing email simplifies the session model, enhances user privacy, and makes the system more flexible for different authentication or anonymous scenarios.
- The new `(session_id, workflow_type)` key is more robust for future expansion with different types of workflows beyond booking.

## Implementation Details

- Applied 13 database migrations to remove the `email` column from the `workflows` table and other related tables.
- Updated all Supabase Edge Functions (`search-availability`, `confirm-appointment`, etc.) to no longer require or use the `email` parameter.
- Modified frontend components (`WorkflowDemo.tsx`, `WorkflowVisualization.tsx`) to manage sessions without email.
- The `workflow_type` is now a critical part of the session context, with "booking" as the primary type.

[2025-08-29 11:08:17] - Email dependency removed from session management.

---

## Decision

**Addition of SMS Confirmation Step**
- Integrated an SMS confirmation step into the booking workflow.
- A new Edge Function, `send-confirmation-sms`, was created to handle the logic.

## Rationale

- Provides a more secure and reliable method of confirming bookings compared to email.
- Enhances the user experience by providing instant confirmation on their mobile device.
- Opens up possibilities for two-way SMS communication in the future.

## Implementation Details

- Added new tables to the database schema to store SMS logs and confirmation status.
- The `send-confirmation-sms` function integrates with a third-party SMS gateway (e.g., Twilio).
- The frontend was updated to include a new step in the `WorkflowVisualization` to show the SMS confirmation status.

[2025-08-29 11:08:17] - SMS confirmation step added to the workflow.

---

## Decision

**New Edge Functions for ElevenLabs Call Lifecycle Management**
- Created three new Supabase Edge Functions: `notify-call-started`, `notify-call-ended`, and `send-confirmation-sms`.
- These functions provide complete lifecycle management for ElevenLabs voice agent interactions.

## Rationale

- The previous implementation only handled parts of the call (e.g., search, confirm).
- A complete lifecycle management system is needed for robust error handling, analytics, and state tracking.
- `notify-call-started` initializes the workflow state when a call begins.
- `notify-call-ended` finalizes the workflow, logs call duration, and handles cleanup.
- Consolidating logic into dedicated functions improves maintainability and separation of concerns.

## Implementation Details

- Each function is a standalone TypeScript file in the `supabase/functions` directory.
- They are designed to be called via webhooks from the ElevenLabs agent at different stages of the conversation.
- The functions are stateless and rely on `session_id` and `workflow_type` passed from the agent.

[2025-08-29 11:08:17] - New Edge Functions for call lifecycle created.

---

## Decision

**Workflow Rebranding: "appointments" to "booking"**
- Renamed the primary workflow type from "appointments" to "booking" throughout the entire codebase and documentation.

## Rationale

- "Booking" is a more generic and widely understood term that can encompass various types of reservations (appointments, services, events).
- This rebranding provides greater flexibility for future expansion of the platform.
- It aligns the project's terminology with industry-standard language.

## Implementation Details

- Performed a global find-and-replace operation across the codebase.
- Updated all instances in frontend components, backend functions, and database records.
- All user-facing UI text has been changed to reflect the new "booking" terminology.

---

## Decision

**Database-Driven Multi-Workflow Architecture Implementation**
- Complete shift from hardcoded single-workflow to database-driven multi-workflow system
- Implementation of `workflow_definitions` table for dynamic configuration
- Creation of `useWorkflowConfig` hook for runtime configuration loading
- Support for multiple workflow types: booking, delivery_change, order_management, customer_support

## Rationale

- The original single-workflow approach was too rigid and limited scalability
- Hardcoded configurations made it difficult to add new workflow types or modify existing ones
- Database-driven approach enables non-technical users to configure workflows
- Multi-workflow support allows the platform to serve different business domains
- Configuration through data rather than code changes improves maintainability

## Implementation Details

- Created `workflow_definitions` table with fields: workflow_type, name, description, agent_id, steps_config
- Rewrote `useWorkflowConfig` hook to load configurations from database at runtime
- Updated all components to use dynamic configuration instead of hardcoded values
- Implemented workflow-specific session management with localStorage keys
- Enhanced `StepDataRenderer` to support 15+ different data display components
- Added dynamic icon mapping system for consistent UI across workflow types

[2025-09-08 09:00:00] - Database-driven multi-workflow architecture successfully implemented

---

## Decision

**Enhanced Step Data Rendering System**
- Expanded `StepDataRenderer` to support intelligent data type detection
- Created 15+ specialized display components for different workflow scenarios
- Implemented priority-based rendering logic for complex data structures

## Rationale

- Different workflow types require different data visualization approaches
- Single rendering approach couldn't handle diverse data structures
- Intelligent detection prevents display errors and improves user experience
- Extensible architecture allows easy addition of new display components

## Implementation Details

- Added detection functions for: available slots, appointment confirmation, call summary, SMS confirmation, package info, delivery options, product catalog, order summary, customer identification, billing analysis, promotions, agent handoff
- Created specialized display components: `AvailableSlotsDisplay`, `AppointmentConfirmationDisplay`, `CallSummaryDisplay`, `SMSConfirmationDisplay`, `PackageInfoDisplay`, `DeliveryOptionsDisplay`, `ProductCatalogDisplay`, `OrderSummaryDisplay`, `CustomerIdentificationDisplay`, `BillingAnalysisDisplay`, `PromotionsDisplay`, `AgentHandoffDisplay`
- Implemented priority-based rendering with customer support displays checked first
- Added generic fallback rendering for unknown data formats

[2025-09-08 09:00:00] - Enhanced step data rendering system implemented

---

## Decision

**Workflow-Specific Session Management**
- Implemented workflow-specific localStorage keys: `workflow_${workflowType}_session_id`
- Added session isolation between different workflow types
- Enhanced session restoration and cleanup functionality

## Rationale

- Original single-workflow session management couldn't handle multiple concurrent workflows
- Session conflicts could occur when users worked with different workflow types
- Workflow-specific keys prevent session pollution and improve user experience
- Better session lifecycle management improves reliability

## Implementation Details

- Modified `WorkflowDemo.tsx` to use workflow-specific localStorage keys
- Updated session restoration logic to check workflow-specific keys
- Enhanced session reset functionality to clean workflow-specific data
- Added automatic session restoration on workflow route navigation

[2025-09-08 09:00:00] - Workflow-specific session management implemented

---

## Decision

**Dynamic Index Page with Workflow Discovery**
- Rewrote `Index.tsx` to dynamically load workflows from database
- Implemented workflow grid display with type-specific icons
- Added loading states and error handling for workflow discovery

## Rationale

- Static workflow listing couldn't accommodate dynamic workflow addition
- Users needed visual discovery of available workflow types
- Database-driven approach enables runtime workflow management
- Better user experience with loading states and error handling

## Implementation Details

- Created `WorkflowDefinition` interface for type safety
- Implemented dynamic workflow loading from `workflow_definitions` table
- Added icon mapping system for different workflow types (Calendar, Truck, UtensilsCrossed, Headphones)
- Enhanced UI with hover effects and smooth transitions
- Added comprehensive error handling and loading states

[2025-09-08 09:00:00] - Dynamic index page with workflow discovery implemented

---

## Decision

**Enhanced ElevenLabs Integration with Workflow Context**
- Updated dynamic variables to include both `session_id` and `workflow_type`
- Implemented workflow-specific agent configuration
- Enhanced error handling for agent communication

## Rationale

- Original integration only passed session_id, limiting agent capabilities
- Workflow context is essential for agent to provide relevant responses
- Enhanced variable passing improves agent decision-making
- Better error handling prevents integration failures

## Implementation Details

- Modified `WorkflowDemo.tsx` to pass workflow_type as dynamic variable
- Updated ElevenLabs widget configuration with enhanced variable mapping
- Added workflow context to agent conversation state
- Improved error handling for agent communication failures

[2025-09-08 09:00:00] - Enhanced ElevenLabs integration with workflow context implemented
[2025-08-29 11:08:17] - Workflow rebranding completed.