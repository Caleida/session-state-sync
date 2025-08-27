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