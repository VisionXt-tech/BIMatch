# Company Dashboard Analytics Enhancement

**Data**: 2025-10-17
**Tipo**: Feature Implementation - Analytics & Charts

## Obiettivo
Arricchire la dashboard company con grafici e statistiche utili per monitorare performance e attività.

## Componenti Creati

### 1. ApplicationsTimelineChart
**File**: `src/components/charts/ApplicationsTimelineChart.tsx`
- Grafico a linee per candidature ricevute
- Mostra ultimi 7 giorni
- Tooltip con dettagli giornalieri
- Colori brand (#008080)

### 2. TopSkillsChart
**File**: `src/components/charts/TopSkillsChart.tsx`
- Grafico a barre orizzontale
- Top 5 skills più richieste nei progetti
- Gradient di colori teal
- Layout compatto e leggibile

## Dashboard Analytics

### Sezione 1: Grafici Comparativi
**Grid 2 colonne (responsive)**

1. **Candidature Timeline**
   - Trend candidature ultimi 7 giorni
   - Formato date: dd/MM
   - Aiuta a identificare picchi di attività

2. **Skills Più Richieste**
   - Top 5 competenze nei progetti pubblicati
   - Mostra quante volte richiesta ogni skill
   - Aiuta a capire focus aziendale

### Sezione 2: Progetti Recenti
**Lista ultimi 3 progetti**

Per ogni progetto:
- Titolo (link a dettagli)
- Località e data pubblicazione
- Badge status (attivo/chiuso/completato)
- Pulsante azione rapida

Features:
- Hover effect teal
- Link veloci
- Badge colorati per status
- Button "Vedi Tutti" → pagina progetti completa

### Sezione 3: Empty State
Quando nessun dato disponibile:
- Icona BarChart3
- Messaggio chiaro
- CTA "Pubblica Progetto"

## Logica Implementata

### Data Fetching
```typescript
fetchAnalytics()
- Query projectApplications (ultimi 7gg)
- Aggregazione per giorno
- Query projects per skills analysis
- Query recent projects (limit 3)
```

### Performance
- Loading states separati per analytics
- Skeleton placeholders
- Queries ottimizzate con where/limit
- Error handling silenzioso (console.error)

### Responsive Design
- Grid 2 colonne desktop
- Stack verticale mobile
- Charts responsive (ResponsiveContainer)

## Benefici

### Per le Aziende
1. **Visibilità immediata** trend candidature
2. **Insight skills** più richieste
3. **Quick access** progetti recenti
4. **Monitoraggio** attività piattaforma

### UX
- Dashboard non più vuota
- Contenuti informativi
- Layout bilanciato
- Navigazione veloce

## File Modificati
- `src/app/dashboard/company/page.tsx` (+200 righe)
- `src/components/charts/ApplicationsTimelineChart.tsx` (nuovo)
- `src/components/charts/TopSkillsChart.tsx` (nuovo)

## Dipendenze
- recharts (già presente)
- date-fns (già presente)
- Firestore queries con orderBy/limit

## Testing Consigliato
1. Dashboard con 0 progetti → empty state
2. Dashboard con progetti ma 0 candidature
3. Dashboard con dati completi
4. Responsive mobile/tablet/desktop

## Note Tecniche
- Charts altezza fissa 280px (aumentata per migliore visibilità)
- Timeline: **8 settimane** (formato: gg-gg Mese, es. "14-20 Ott")
- Week starts on Monday (weekStartsOn: 1)
- Skills top 5 (modificabile)
- Skills chart: width 150px per Y-axis (evita truncation labels)
- Recent projects limit 3
- Formato date italiano (locale: it)

## Fix Applicati
1. **TopSkillsChart**: Aumentato width Y-axis da 120 a 150px + margin left 10px
2. **ApplicationsTimelineChart**: Cambiato da giorni a settimane (8 settimane totali)
3. **Charts height**: Uniformato a 280px per coerenza visiva

## Risultato
Dashboard company ora fornisce analytics visuale utile, migliorando engagement e usabilità per le aziende.
