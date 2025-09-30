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
- **Security**: Rate limiting, audit logging, input validation, GDPR compliance

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
  - `core/` - Core app components (Navbar, Footer, Logo, ClientLayout)
  - `ui/` - shadcn/ui component library
- `src/contexts/` - React Context providers (AuthContext, FirebaseContext)
- `src/types/` - TypeScript type definitions (auth.ts, project.ts, notification.ts, marketplace.ts)
- `src/lib/` - Utilities, Firebase configuration, security modules
  - `firebase/` - Firebase client configuration
  - `security/` - File validation, input sanitization
  - `notifications/` - Secure notification service
  - `validation/` - Password validation
  - `gdpr/` - Privacy utilities
- `src/constants/` - Application constants (routes, roles, BIM skills, software options)
- `src/hooks/` - Custom React hooks (useRateLimit, useSessionTimeout)

### Authentication & User Management

The app uses Firebase Authentication with custom user profiles stored in Firestore:
- Professional profiles include BIM skills, software proficiency, certifications (with self-certification support), portfolio links, CV URLs, and availability
- Company profiles include business details, contact information, VAT numbers, and project types
- Role-based access control enforced throughout the application via `AuthContext`
- Login includes rate limiting (5 attempts per 15 minutes) to prevent brute force attacks
- Audit logging tracks authentication events for security monitoring
- Profile updates are secured to only allow authenticated users to modify their own data

### Routing and Navigation

Routes are centralized in `src/constants/index.ts` under the `ROUTES` object. Key route patterns:
- Role-specific dashboards: `/dashboard/professional`, `/dashboard/company`, `/dashboard/admin`
- Public marketplace: `/professionals` (browse professionals), `/projects/[projectId]` (view project details)
- Navigation items for each role are exported as `ProfessionalNavItems`, `CompanyNavItems`, and `AdminNavItems`

### Project Application Workflow

Projects have a detailed application lifecycle managed through Firestore:
- **Application statuses**: `inviata`, `in_revisione`, `preselezionata`, `colloquio_proposto`, `colloquio_accettato_prof`, `colloquio_rifiutato_prof`, `colloquio_ripianificato_prof`, `rifiutata`, `ritirata`, `accettata`
- Companies can propose interviews with dates and messages
- Professionals can accept, reject, or propose alternative dates for interviews
- Applications track cover letters, relevant skills, availability notes, rejection reasons, and interview proposals
- Notification system (in `src/types/notification.ts`) keeps both parties informed of status changes

### Important Configuration Notes

- Development server runs on port 9002 to avoid conflicts
- TypeScript and ESLint errors are ignored during builds (configured in next.config.ts)
- Firebase configuration uses environment variables from .env.local
- Image optimization configured for external domains (Unsplash, placeholder services, Firebase Storage)
- Security headers are configured in next.config.ts (CSP temporarily disabled for debugging)
- Turbopack is used for faster development builds

### Environment Setup

Ensure `.env.local` contains all required Firebase configuration variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` (optional, set to "true" for local Firebase emulators)

### Data Models

User profiles extend a base interface with role-specific fields:
- **ProfessionalProfile**: Tracks BIM skills, certifications (Albo registration, UNI 11337 certification with URLs and self-certification flags), portfolio, CV, monthly rate, LinkedIn profile, and experience level
- **CompanyProfile**: Includes VAT numbers, company size, industry sector, locations, contact person details, logo URL, and company description
- **Project**: Contains title, description, required skills/software, location, budget range, duration, application deadline, and status (`attivo`, `in_revisione`, `completato`, `chiuso`, `bozza`)
- **ProjectApplication**: Tracks application details, status, cover letter, interview proposals, professional responses, and timestamps
- All profiles include Firebase timestamps for created/updated tracking

### Security Considerations

- File uploads are validated in `src/lib/security/fileValidation.ts` with type, size, and content checks
- Input sanitization is performed via `src/lib/validation.ts` using isomorphic-dompurify
- Rate limiting implemented in `src/hooks/useRateLimit.ts` for login and sensitive operations
- Audit logging in `src/lib/auditLog.ts` tracks security events with severity levels
- Profile updates enforce that users can only modify their own data via uid verification
- Session timeouts are managed via `src/hooks/useSessionTimeout.ts`