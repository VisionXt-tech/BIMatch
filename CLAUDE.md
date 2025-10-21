# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server on port 9002 with Turbopack
- `npm run build` - Build the production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check without emitting files
- `npm run genkit:dev` - Start Genkit development server (required for AI contract generation)
- `npm run genkit:watch` - Start Genkit with watch mode

## Project Architecture

BIMatch is a specialized BIM (Building Information Modeling) marketplace platform built with Next.js 15, TypeScript, and Firebase. The application connects BIM professionals with companies and engineering firms in Italy.

### Core Technology Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication, Hosting, Storage)
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
  - `verify-email/` - Email verification page
- `src/components/` - Reusable React components
  - `core/` - Core app components (Navbar, Footer, Logo, ClientLayout)
  - `ui/` - shadcn/ui component library
- `src/contexts/` - React Context providers (AuthContext, FirebaseContext)
- `src/types/` - TypeScript type definitions (auth.ts, project.ts, notification.ts, marketplace.ts)
- `src/lib/` - Utilities, Firebase configuration, security modules
  - `firebase/` - Firebase client configuration
  - `server/` - Server-side rate limiting with Firestore
  - `security/` - File validation, input sanitization
  - `notifications/` - Secure notification service
  - `validation/` - Password validation
  - `gdpr/` - Privacy utilities
- `src/constants/` - Application constants (routes, roles, BIM skills, software options)
- `src/hooks/` - Custom React hooks (useRateLimit, useSessionTimeout)
- `src/ai/` - Genkit AI flows and prompts
  - `genkit.ts` - Genkit configuration with Gemini 2.0 Flash
  - `flows/` - AI flows (contract generation)
  - `prompts/` - Prompt engineering templates
- `docs/` - Documentation files
  - `CONTRACTS_AI_GUIDE.md` - Complete guide for AI contract generation
  - `CONTRACTS_QUICK_START.md` - Quick start tutorial
  - `CONTRACTS_AI_IMPLEMENTATION_SUMMARY.md` - Technical implementation summary
- `scripts/` - Utility and deployment scripts
  - `deployment/` - Deployment automation (deploy.ps1, use-node-20.ps1)
  - `utils/` - Utility scripts (cleanup-user-data.js, find-user-uid.js, security-test-script.js)

### Authentication & User Management

The app uses Firebase Authentication with custom user profiles stored in Firestore:
- Professional profiles include BIM skills, software proficiency, certifications (with self-certification support), portfolio links, CV URLs, and availability
- Company profiles include business details, contact information, VAT numbers, and project types
- Role-based access control enforced throughout the application via `AuthContext`
- **Email Verification**: Users must verify email before accessing dashboard (enforced at login)
- **Rate Limiting**: Dual-layer protection (client + server-side via Firestore)
  - Login: 5 attempts per 15 minutes
  - Register: 3 attempts per 1 hour
  - Password Reset: 3 attempts per 1 hour
- **Audit Logging**: All authentication events tracked with severity levels
- **Session Management**: Automatic logout after inactivity (useSessionTimeout hook)
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
- **Image handling**: Background images use CSS `backgroundImage`, content images use standard `<img>` tags (not Next.js Image optimization to avoid Cloud Function timeouts)
- Security headers are configured in next.config.ts (CSP temporarily disabled for debugging)
- Turbopack is used for faster development builds

### Environment Setup

Ensure `.env.local` contains all required Firebase configuration variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (must be `.firebasestorage.app` format)
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

- **File Uploads**: Validated in `src/lib/security/fileValidation.ts` with type, size, and content checks
- **Input Sanitization**: Performed via `src/lib/validation.ts` using isomorphic-dompurify
- **Rate Limiting**: Dual-layer implementation
  - Client-side: `src/hooks/useRateLimit.ts` (fast, bypassable)
  - Server-side: `src/lib/server/rateLimiter.ts` (secure, Firestore-based, non-bypassable)
- **Audit Logging**: `src/lib/auditLog.ts` tracks security events with severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- **Profile Updates**: Enforce that users can only modify their own data via uid verification
- **Session Timeouts**: Managed via `src/hooks/useSessionTimeout.ts`
- **GDPR Compliance**: Privacy policy, Terms of Service, Cookie banner

### Firebase Deployment

**Production URL**: https://bimatch-cd100.web.app

**Deployment Process**:
1. Ensure Node.js 20 is active: `scripts/deployment/use-node-20.ps1`
2. Build production: `npm run build`
3. Deploy: `firebase deploy --only hosting,storage` or use `scripts/deployment/deploy.ps1`

**Firebase Configuration**:
- Hosting: SSR with Cloud Functions Gen2, Node 20 runtime
- Firestore: Production indexes defined in `firestore.indexes.json`
- Storage: Public read for profileImages, private for CV/certificates
- Authentication: Email/password with email verification enforcement

**Important Notes**:
- Storage bucket: `bimatch-cd100.firebasestorage.app` (NOT `.appspot.com`)
- Firestore indexes must be deployed before production use
- Email verification templates can be customized in Firebase Console
- Rate limiting uses Firestore collection `rateLimits` with TTL cleanup

### Troubleshooting

**Images Not Loading in Production**:
- Unsplash images use direct URLs with CSS/HTML (not Next.js Image)
- Check Storage rules allow public read for `profileImages/`
- Verify `.env.local` has correct Storage bucket (`.firebasestorage.app`)

**Build Errors**:
- Close dev server before building (port 9002 conflict)
- Delete `.next/` folder if build fails with EPERM errors
- Check Node version is 20.x: `node -v`

**Rate Limiting Issues**:
- Server-side rate limits stored in Firestore `rateLimits` collection
- Check Firestore rules allow write for authenticated users
- Rate limit data auto-expires via Firestore TTL

**Email Verification**:
- Users redirected to `/verify-email` if email not verified
- Resend email available after 60-second cooldown
- Check Firebase Console > Authentication > Templates for email customization

**AI Contract Generation**:
- Admin-only feature accessible at `/dashboard/admin/contracts`
- Requires applications in interview stage
- Genkit must be running for development: `npm run genkit:dev`
- See `docs/CONTRACTS_AI_GUIDE.md` for complete documentation
- Common issues:
  - "Application not found": Check Firestore path `jobs/{jobId}/applications/{applicationId}`
  - "Must be in interview stage": Update application status to `colloquio_accettato_prof`
  - Timeout: Check Gemini API quota in Google Cloud Console
