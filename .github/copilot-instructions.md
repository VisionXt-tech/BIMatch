# AI Agent Instructions for BIMatch

This document provides essential guidance for AI agents working with the BIMatch codebase, a BIM (Building Information Modeling) marketplace platform connecting professionals with companies in Italy.

## Key Project Patterns

### Authentication & Security

- **Dual-Layer Rate Limiting** pattern in all auth flows:
  1. Client-side fast check (`src/hooks/useRateLimit.ts`)
  2. Server-side Firestore-based validation (`src/lib/server/rateLimiter.ts`)
  Example: See `src/contexts/AuthContext.tsx` login implementation

- **File Upload Security** chain:
  1. Client validation (`src/hooks/useSecureFileUpload.ts`)
  2. Server-side validation (`src/app/api/validate-file/route.ts`)
  3. Firebase Storage upload with sanitized paths

### Role-Based Architecture

Three user types with distinct flows and interfaces:
- **Professionals**: BIM specialists seeking projects
- **Companies**: Organizations posting BIM projects
- **Admins**: Platform administrators

Role checks required in:
1. Route middleware (`src/middleware.ts`)
2. Component-level guards (via `AuthContext`)
3. Firestore security rules

### Project Application State Machine

Project applications follow strict status transitions:
```
inviata → in_revisione → preselezionata → colloquio_proposto → 
[colloquio_accettato_prof | colloquio_rifiutato_prof | colloquio_ripianificato_prof] →
[rifiutata | ritirata | accettata]
```

See `src/types/application.ts` for full state definitions.

## Development Workflow

### Environment Setup

1. Required Node.js 20.x (use `scripts/deployment/use-node-20.ps1`)
2. Copy `.env.local.example` to `.env.local` and fill Firebase config
3. Run `npm install`
4. Start dev server: `npm run dev` (runs on port 9002)

### Common Commands

- `npm run dev` - Development server with Turbopack
- `npm run typecheck` - TypeScript validation
- `npm run lint` - ESLint checks
- `npm run build` - Production build

### Testing Security Features

Use `scripts/utils/security-test-script.js` for:
- Rate limiting validation
- Security headers
- XSS protection
- Session security
- Cookie security

## Integration Points

### Firebase Services

1. **Authentication**: Email/password with custom claims for roles
2. **Firestore**: Primary data store with role-based rules
3. **Storage**: File uploads with path pattern `/users/{userId}/{folder}/{timestamp}_{filename}`
4. **Hosting**: Production deployment target

### External Services

- **Email Templates**: Firebase Extension for transactional emails
- **Image CDN**: Direct uploads (Next.js Image optimization disabled)

## Project Structure Conventions

- `src/app/` - Next.js 15 App Router pages/layouts
- `src/components/` - React components (core + shadcn/ui)
- `src/contexts/` - React Context providers
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and core services
- `src/types/` - TypeScript definitions

## Performance Considerations

1. Background images use CSS `backgroundImage`
2. Content images use standard `<img>` tags
3. TypeScript/ESLint errors non-blocking in builds
4. Turbopack enabled for faster development

## Error Handling Standards

- Rate limiting errors include retry-after times
- File validation provides detailed error messages
- Authentication flows have audit logging (`src/lib/auditLog.ts`)
- Security events tracked with severity levels (LOW to CRITICAL)