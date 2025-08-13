# Overview

This is a full-stack web application for managing a church raffle system, specifically designed for Pathway Vineyard Church GNG Campus's Blueberry Festival. The application allows visitors to enter raffle drawings and provides administrators with tools to manage entries, prizes, and winner selection. The system includes automated notification capabilities to inform winners via SMS and email.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build System**: React 18 with TypeScript using Vite as the build tool for fast development and optimized production builds.

**UI Framework**: Built on shadcn/ui components with Radix UI primitives, providing accessible and customizable UI components with consistent design patterns.

**Styling**: Tailwind CSS with custom church-themed color variables (blueberry theme) and CSS custom properties for dynamic theming.

**State Management**: TanStack Query (React Query) handles all server state management, caching, and synchronization with optimized query strategies for different data types.

**Routing**: Wouter provides lightweight client-side routing with a simple API suitable for the application's limited route requirements.

**Form Handling**: React Hook Form with Zod validation ensures type-safe form handling with client-side validation and error management.

## Backend Architecture

**Runtime & Framework**: Node.js with Express.js framework providing RESTful API endpoints with separate public and admin route handling.

**Language**: TypeScript with ESM modules for modern JavaScript features and type safety across the entire backend.

**API Design**: RESTful architecture with clear separation between public endpoints (raffle entry submission) and protected admin endpoints (management functions).

**Authentication**: Simple bearer token authentication for admin access with hardcoded credentials for security simplicity.

**Error Handling**: Centralized error handling middleware with structured error responses and proper HTTP status codes.

**Logging**: Custom request/response logging with performance metrics and structured output for debugging and monitoring.

## Data Layer

**Database**: PostgreSQL hosted on Neon Database (serverless) providing scalable, managed database hosting with WebSocket support.

**ORM**: Drizzle ORM with type-safe schema definitions, enabling compile-time type checking and automated type generation.

**Schema Management**: Drizzle Kit handles database migrations and schema management with version control integration.

**Connection**: Connection pooling using Neon's serverless driver optimized for serverless deployments with WebSocket fallback.

## Database Schema Design

**Core Tables**:
- `raffle_entries`: Participant information with duplicate prevention on name/email and phone combinations
- `prizes`: Prize catalog with availability tracking and descriptions
- `winners`: Junction table linking entries to prizes with claim tracking and notification status
- `Relations`: Proper foreign key relationships with cascading operations for data integrity

**Duplicate Prevention**: Multi-level duplicate checking prevents the same person from entering multiple times using both name/email combinations and phone number uniqueness.

## Authentication & Authorization

**Admin Authentication**: Password-based authentication with bearer token generation for session management.

**Token Management**: Client-side localStorage for token persistence with automatic validation on protected routes.

**Route Protection**: Conditional routing and component rendering based on authentication status with proper error handling.

**API Security**: Bearer token validation middleware on all admin endpoints with proper error responses for unauthorized access.

## Winner Notification System

**Integration**: Clearstream.io API integration for automated communication with winners through multiple channels.

**Dual Channel**: Simultaneous SMS and email notifications ensure winners receive messages through their preferred communication method.

**Tracking**: Database tracking of notification timestamps and delivery status for administrative oversight and follow-up capabilities.

# External Dependencies

## Core Dependencies

**Database**: Neon Database (PostgreSQL) - Serverless PostgreSQL hosting with connection pooling and WebSocket support for modern web applications.

**ORM**: Drizzle ORM with Drizzle Kit for type-safe database operations and schema management with migration support.

**UI Framework**: Radix UI primitives providing accessible, unstyled UI components as the foundation for the shadcn/ui component system.

**Styling**: Tailwind CSS for utility-first styling with PostCSS for processing and autoprefixer for browser compatibility.

## Communication Services

**Email Service**: SendGrid API integration for reliable email delivery with tracking and analytics capabilities.

**SMS/Communication**: Clearstream.io API for automated SMS and email notifications to raffle winners with delivery confirmation.

## Development Tools

**Build System**: Vite for fast development server, hot module replacement, and optimized production builds with TypeScript support.

**Validation**: Zod for runtime type validation and schema definition with React Hook Form integration for form validation.

**State Management**: TanStack Query for server state management, caching, and background synchronization with React applications.

**Routing**: Wouter for lightweight client-side routing with minimal bundle impact and simple API surface.

## Production Infrastructure

**Runtime**: Node.js runtime environment with Express.js for server-side application hosting and API endpoints.

**Session Management**: connect-pg-simple for PostgreSQL-based session storage with Express session middleware integration.

**Error Tracking**: Built-in error handling and logging systems for debugging and monitoring application health.