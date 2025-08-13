# Blueberry Festival Raffle System

## Overview

This is a full-stack church raffle management system built for Pathway Vineyard Church GNG Campus's Blueberry Festival. The application enables visitors to enter raffle drawings for various prizes and provides administrators with tools to manage entries, prizes, and conduct drawings. The system includes automated winner notification capabilities and comprehensive administrative features for tracking the entire raffle process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React 18 with TypeScript and Vite for fast development and building. The UI is built with shadcn/ui components on top of Radix UI primitives, providing accessible and customizable interface elements. Styling is handled through Tailwind CSS with custom church-themed color variables for branding consistency.

State management follows a modern approach using TanStack Query (React Query) for server state, eliminating the need for complex global state solutions. Client-side routing is handled by Wouter, a lightweight alternative to React Router. Form handling combines React Hook Form with Zod validation for type-safe, performant form management.

### Backend Architecture
The server runs on Node.js with Express.js framework, fully written in TypeScript using ESM modules. The API follows RESTful design principles with clear separation between public endpoints (for raffle entries) and admin-protected endpoints (for management functions).

Authentication uses a simple bearer token system for admin access, with centralized error handling middleware providing structured error responses. Custom logging middleware tracks request/response cycles with performance metrics for debugging and monitoring.

### Data Layer
The application uses PostgreSQL as the primary database, hosted on Neon Database for serverless scalability. Drizzle ORM provides type-safe database operations with full TypeScript integration. Database schema management is handled through Drizzle Kit for migrations and schema evolution.

The schema includes four main entities: raffle_entries for participant data, prizes for available awards, winners as a junction table linking entries to prizes, and proper foreign key relationships with cascading operations. Connection pooling uses Neon's serverless driver with WebSocket support for optimal performance.

### Authentication & Authorization
Admin authentication relies on password-based access with hardcoded credentials for simplicity. Tokens are stored client-side in localStorage, with conditional routing based on authentication status. API security implements bearer token validation on all administrative endpoints.

### Winner Notification System
The system integrates with Clearstream.io for automated communication to winners. When a winner is selected, the system automatically sends both SMS and email notifications simultaneously. The database tracks notification timestamps to ensure proper communication flow and prevent duplicate messages.

### Build and Deployment
The application uses a monorepo structure with shared TypeScript schemas between client and server. Vite handles frontend building and development, while esbuild bundles the server for production deployment. The build process generates optimized static assets and a bundled Node.js server executable.

## External Dependencies

**Database Services:**
- Neon Database (PostgreSQL) - Serverless database hosting with connection pooling
- Drizzle ORM - Type-safe database operations and schema management

**UI Framework:**
- shadcn/ui - Component library built on Radix UI primitives
- Radix UI - Accessible, unstyled UI components
- Tailwind CSS - Utility-first CSS framework

**Communication Services:**
- Clearstream.io - SMS and email notification service for winner notifications

**Development Tools:**
- Vite - Frontend build tool and development server
- TypeScript - Type safety across the entire application
- React Query (TanStack Query) - Server state management
- React Hook Form + Zod - Form handling and validation

**Runtime Environment:**
- Node.js - Server runtime environment
- Express.js - Web application framework