# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server on port 9002 with Turbopack
- `npm run build` - Build the production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check without emitting files
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode

## Project Architecture

BIMatch is a specialized BIM (Building Information Modeling) marketplace platform built with Next.js 15, TypeScript, and Firebase. The application connects BIM professionals with companies and engineering firms in Italy.

### Core Technology Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **AI Integration**: Google Genkit for AI-powered features
- **Form Handling**: React Hook Form with Zod validation

### Application Structure

The app follows a role-based architecture with three user types:
1. **Professionals** - BIM specialists seeking projects
2. **Companies** - Organizations posting BIM projects
3. **Admins** - Platform administrators

### Key Directories

- `src/app/` - Next.js App Router pages and layouts
  - `dashboard/` - Role-specific dashboard pages (professional, company, admin)
  - `register/` - Registration flows for professionals and companies
- `src/components/` - Reusable React components
  - `core/` - Core app components (Navbar, Footer, etc.)
  - `ui/` - shadcn/ui component library
- `src/contexts/` - React Context providers (Auth, Firebase)
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utilities and Firebase configuration
- `src/constants/` - Application constants

### Authentication & User Management

The app uses Firebase Authentication with custom user profiles stored in Firestore:
- Professional profiles include BIM skills, software proficiency, certifications, and portfolio links
- Company profiles include business details, contact information, and project types
- Role-based access control throughout the application

### Important Configuration Notes

- Development server runs on port 9002 to avoid conflicts
- TypeScript and ESLint errors are ignored during builds (configured in next.config.ts)
- Firebase configuration uses environment variables from .env.local
- Image optimization configured for external domains (Unsplash, placeholder services)

### Environment Setup

Ensure `.env.local` contains all required Firebase configuration variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` 
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Data Models

User profiles extend a base interface with role-specific fields:
- Professional profiles track BIM skills, certifications (Albo, UNI 11337), portfolio, and availability
- Company profiles include VAT numbers, locations, and contact details
- All profiles include Firebase timestamps for created/updated tracking