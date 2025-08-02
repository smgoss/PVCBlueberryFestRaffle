# Blueberry Festival Raffle System

## Overview

This is a full-stack web application for managing a church raffle system, specifically for Pathway Vineyard Church GNG Campus's Blueberry Festival. The application allows visitors to enter raffle drawings and provides administrative capabilities for managing entries, prizes, and winners. Built as a modern React frontend with an Express.js backend, it features a clean, church-themed UI with comprehensive raffle management functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom church-themed color variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with separate public and admin endpoints
- **Authentication**: Simple bearer token authentication for admin access
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Logging**: Custom request/response logging with performance metrics

### Data Layer
- **Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling using Neon's serverless driver with WebSocket support

### Database Schema Design
- **raffle_entries**: Stores participant information (name, phone) with duplicate prevention
- **prizes**: Manages available prizes with availability status
- **winners**: Junction table linking entries to prizes with claim tracking
- **Relations**: Proper foreign key relationships with cascading operations

### Authentication & Authorization
- **Admin Access**: Password-based authentication with hardcoded credentials
- **Token Storage**: Client-side storage in localStorage
- **Route Protection**: Conditional routing based on authentication status
- **API Security**: Bearer token validation on admin endpoints

### UI/UX Design Patterns
- **Design System**: Consistent component library with church branding
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Color Scheme**: Custom blueberry and church-themed color palette
- **Accessibility**: Radix UI primitives ensure good accessibility practices
- **Loading States**: Proper loading and error states throughout the application

### Development & Build Process
- **Development**: Hot reload with Vite development server
- **Build**: Separate client and server builds with esbuild for backend
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared types
- **Linting**: ESM modules with strict TypeScript configuration

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections via ws library

### UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for styling

### Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and introspection tool
- **TypeScript**: Static type checking and enhanced developer experience

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & class-variance-authority**: Conditional CSS class management
- **nanoid**: Secure unique ID generation