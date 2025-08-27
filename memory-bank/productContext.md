# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.

2025-08-27 14:22:00 - Initial Memory Bank creation and project analysis completed.

## Project Goal

Create a session-state-sync demonstration project that showcases a real-time workflow management system for appointment booking. The primary goal is to demonstrate how session state can be synchronized across different components and maintained through browser sessions using localStorage and Supabase realtime functionality.

## Key Features

* **Session State Persistence** - Uses localStorage to maintain workflow sessions across browser refreshes
* **Real-time Workflow Visualization** - Live updates of workflow steps using Supabase realtime subscriptions
* **Interactive Workflow Simulator** - Buttons to simulate different steps in an appointment booking process
* **BEYOND Citas Integration Demo** - Simulates integration with external appointment management system
* **ElevenLabs ConvAI Integration** - Voice AI conversation capabilities for phone-based interactions
* **Responsive UI** - Built with shadcn-ui components and Tailwind CSS for modern interface
* **Multi-step Workflow Process** - Comprehensive appointment booking flow from call start to completion

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
- Supabase Edge Functions for API endpoints (search-availability, confirm-appointment)
- PostgreSQL database with realtime subscriptions

**Key Components:**
- WorkflowDemo.tsx - Main demo page with session management
- WorkflowVisualization.tsx - Real-time workflow step display
- WorkflowSimulator.tsx - Interactive step simulation controls
- Supabase client integration for realtime updates

**Workflow Steps:**
1. Waiting → 2. Call Started → 3. Searching Availability → 4. Showing Availability → 5. Confirming Appointment → 6. Appointment Confirmed → 7. Call Ended