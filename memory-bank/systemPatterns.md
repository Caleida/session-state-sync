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