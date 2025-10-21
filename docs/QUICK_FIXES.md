# Quick Performance Fixes - Apply These Now

## 1. Parallel Fetch in API Route (5 min)

### File: `src/app/api/contracts/generate/route.ts`

**Current (Sequential - SLOW)**:
```typescript
let applicationRef = doc(db, 'jobs', jobId, 'applications', applicationId);
let applicationSnap = await getDoc(applicationRef);

if (!applicationSnap.exists()) {
  applicationRef = doc(db, 'projectApplications', applicationId);
  applicationSnap = await getDoc(applicationRef);
}
```

**Fixed (Parallel - FAST)**:
```typescript
const [jobAppSnap, flatAppSnap] = await Promise.all([
  getDoc(doc(db, 'jobs', jobId, 'applications', applicationId)),
  getDoc(doc(db, 'projectApplications', applicationId))
]);

let applicationSnap = jobAppSnap.exists() ? jobAppSnap : flatAppSnap;
let applicationRef = jobAppSnap.exists() 
  ? doc(db, 'jobs', jobId, 'applications', applicationId)
  : doc(db, 'projectApplications', applicationId);
```

**Same for project**:
```typescript
const [jobProjSnap, flatProjSnap] = await Promise.all([
  getDoc(doc(db, 'jobs', jobId)),
  getDoc(doc(db, 'projects', jobId))
]);

let projectSnap = jobProjSnap.exists() ? jobProjSnap : flatProjSnap;
```

**Impact**: ~50% faster contract generation

---

## 2. Use Optimized Helpers (10 min)

### In any component with multiple user fetches:

**Before**:
```typescript
const user1 = await getDoc(doc(db, 'users', id1));
const user2 = await getDoc(doc(db, 'users', id2));
const user3 = await getDoc(doc(db, 'users', id3));
```

**After**:
```typescript
import { batchGetDocs } from '@/lib/firestore-optimizations';

const users = await batchGetDocs<UserProfile>(
  db,
  'users',
  [id1, id2, id3]
);
// users is a Map<string, UserProfile | null>
```

---

## 3. Add React.memo to Heavy Components (5 min each)

### File: `src/components/ui/card.tsx`

**Wrap with memo**:
```typescript
import { memo } from 'react';

const Card = memo(({ className, ...props }) => {
  return (
    <div className={cn("rounded-lg border", className)} {...props} />
  );
});

Card.displayName = "Card";
export { Card };
```

**Same for**:
- `Table`
- `Badge`
- `Button` (if used in lists)

---

## 4. Add Loading Skeletons Everywhere (10 min)

Check these files DON'T have loading states:
```bash
grep -L "Skeleton" src/app/**/page.tsx
```

**Template**:
```typescript
if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
```

---

## 5. Add Indexes to Firestore (CRITICAL - 2 min)

### File: `firestore.indexes.json`

**Verify these exist**:
```json
{
  "indexes": [
    {
      "collectionGroup": "projectApplications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "applicationDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "contracts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Deploy**:
```bash
firebase deploy --only firestore:indexes
```

---

## 6. Environment Variables Check (1 min)

**Verify in .env.local**:
```bash
# All NEXT_PUBLIC_ vars are set?
grep "NEXT_PUBLIC_" .env.local | wc -l
# Should be 7 lines

# No placeholder values?
grep "your_" .env.local
# Should be empty
```

---

## 7. Clean Build Before Deploy (2 min)

**Always run**:
```bash
# Remove old build
rm -rf .next

# Fresh build
npm run build

# Check for errors
npm run typecheck
```

---

## 8. Add Error Boundaries (15 min)

### Create: `src/components/ErrorBoundary.tsx`

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Qualcosa è andato storto</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'Errore sconosciuto'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Ricarica Pagina
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

**Usage**:
```typescript
<ErrorBoundary>
  <YourHeavyComponent />
</ErrorBoundary>
```

---

## 9. Compress Images Before Upload (Optional - 20 min)

### Install:
```bash
npm install browser-image-compression
```

### Use in upload handlers:
```typescript
import imageCompression from 'browser-image-compression';

const handleImageUpload = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  
  const compressedFile = await imageCompression(file, options);
  // Now upload compressedFile instead of file
};
```

---

## 10. Quick Win: Add meta tags (5 min)

### File: `src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'BIMatch - Marketplace BIM Professionals',
  description: 'Connetti professionisti BIM con aziende in Italia',
  keywords: 'BIM, Building Information Modeling, lavoro, professionisti',
  openGraph: {
    title: 'BIMatch',
    description: 'Marketplace BIM Professionals',
    images: ['/og-image.png'],
  },
};
```

---

## Priority Order

1. ✅ **Firestore indexes** (CRITICAL - deploy now)
2. ✅ **Parallel queries in API** (High impact)
3. ✅ **React.memo heavy components** (Easy win)
4. ✅ **Error boundaries** (Better UX)
5. ✅ **Loading skeletons** (Better UX)
6. ⏭️  Image compression (Optional)
7. ⏭️  Meta tags (SEO)

**Estimated total time**: 1-2 hours
**Expected performance gain**: 40-50% faster
