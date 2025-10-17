# Candidates Page UI Alignment

**Data**: 2025-10-17
**Tipo**: UI Consistency Update

## Obiettivo
Uniformare la pagina `/dashboard/company/candidates` allo stile delle altre pagine company già ottimizzate.

## Modifiche Applicate

### 1. Layout Container
```typescript
// Prima
<div className="space-y-6">

// Dopo
<div className="space-y-4 w-full max-w-7xl mx-auto px-4">
```
- ✅ Max-width 7xl per coerenza
- ✅ Padding orizzontale
- ✅ Spaziatura ridotta a `space-y-4`

### 2. Header Section
**Prima**: Button "Torna Indietro" + Card con icona

**Dopo**: Card header unificato
```typescript
<Card className="border border-gray-200 bg-white">
  <CardContent className="p-8">
    <h1>Candidati: {project.title}</h1>
    <p>Gestisci i professionisti candidati</p>
    <Button>Torna ai Progetti</Button>
  </CardContent>
</Card>
```

Features:
- Title: `text-lg font-semibold text-gray-900`
- Description: `text-sm text-gray-600`
- Button integrato nel header
- Padding uniforme `p-8`

### 3. Skeleton States
**Prima**: Skeleton generico con shadow

**Dopo**: Stile unificato
```typescript
<Card className="border border-gray-200 bg-white">
  <CardContent className="p-8">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/2 mt-4" />
  </CardContent>
</Card>
```

### 4. Error States
**Prima**: Border dashed colorato + background colorato

**Dopo**: Card pulita con icone grigie
```typescript
<Card className="border border-gray-200 bg-white">
  <CardContent className="p-16 text-center">
    <WifiOff className="h-12 w-12 text-gray-400" />
    <p className="text-sm font-semibold text-gray-900">Errore</p>
    <p className="text-sm text-gray-600">{error}</p>
  </CardContent>
</Card>
```

Features:
- Icone grigie (`text-gray-400`)
- Text sizing uniforme
- Padding generoso `p-16`
- Sfondo bianco pulito

### 5. Empty State
**Prima**: Border dashed + testo generico

**Dopo**: Icona Users + messaging chiaro
```typescript
<div className="text-center py-16">
  <Users className="h-12 w-12 text-gray-400 mb-4" />
  <p className="text-sm font-semibold text-gray-900 mb-2">Nessuna candidatura</p>
  <p className="text-sm text-gray-600">Descrizione</p>
</div>
```

### 6. Candidates List Card
```typescript
<Card className="border border-gray-200 bg-white">
  <CardContent className="p-8">
    {/* Table content */}
  </CardContent>
</Card>
```
- Rimossa CardHeader separata
- Content padding `p-8`
- Border grigio pulito

## Pattern Unificati Applicati

### Colors
- **Primario**: `#008080` (buttons, links)
- **Testo**: `gray-900` (titoli), `gray-600` (descrizioni)
- **Bordi**: `border-gray-200`
- **Background**: `bg-white`, `bg-gray-50`
- **Icone**: `text-gray-400` (stati vuoti)

### Typography
- **Titoli pagina**: `text-lg font-semibold text-gray-900`
- **Descrizioni**: `text-sm text-gray-600`
- **Empty states**: `text-sm font-semibold`

### Spacing
- **Card padding**: `p-8`
- **Gap verticale**: `space-y-4`
- **Empty states**: `py-16`
- **Layout max-width**: `max-w-7xl mx-auto px-4`

### Components
- **Cards**: `border border-gray-200 bg-white`
- **Buttons**: `variant="outline" size="lg"`
- **Skeleton**: altezze specifiche (h-8, h-4)

## File Modificato
- `src/app/dashboard/company/candidates/page.tsx`

## Sezioni Aggiornate
1. ✅ Loading skeleton
2. ✅ Error state
3. ✅ Not found state
4. ✅ Header section
5. ✅ Empty state (no candidates)
6. ✅ Main card container

## Risultato
La pagina candidates ora ha:
- ✅ Layout coerente con dashboard, projects, profile
- ✅ Stile visual unificato
- ✅ Spacing e padding consistenti
- ✅ Typography uniforme
- ✅ Stati (loading, error, empty) allineati

## Note
- Mantenuta funzionalità table esistente
- Dialogs e modali non modificati (già con stile coerente)
- Focus su layout e container styling
