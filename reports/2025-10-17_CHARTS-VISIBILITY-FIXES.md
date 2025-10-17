# Charts Visibility & Formatting Fixes

**Data**: 2025-10-17
**Tipo**: Bug Fixes - Charts Display

## Problemi Risolti

### 1. TopSkillsChart - Labels Troncate ❌ → ✅

**Problema**: Nomi skills lunghi venivano tagliati e non erano completamente visibili

**Soluzioni Applicate**:
- ✅ Aumentato width Y-axis da 150px a **180px**
- ✅ Ridotto padding left card da 6px a **2px** per più spazio
- ✅ Custom tick component con **truncate intelligente** (max 20 caratteri + "...")
- ✅ Tooltip mostra nome skill completo al hover
- ✅ Font size ottimizzato a 11px con fontWeight 500
- ✅ Aumentato margin left chart a 5px
- ✅ Aumentata altezza grafico a **300px** (da 280px)
- ✅ Aggiunto **LabelList** con conteggio numerico a destra delle barre

**Codice Custom Tick**:
```typescript
const CustomYAxisTick = ({ x, y, payload }: any) => {
  const label = getSkillLabel(payload.value);
  const maxLength = 20;
  const displayLabel = label.length > maxLength
    ? label.substring(0, maxLength) + '...'
    : label;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#374151" fontSize={11} fontWeight={500}>
        {displayLabel}
      </text>
    </g>
  );
};
```

### 2. ApplicationsTimelineChart - Asse X Migliorato ❌ → ✅

**Problema**: Etichette settimane sovrapposte e poco leggibili

**Soluzioni Applicate**:
- ✅ Custom tick component con **split su due righe**
- ✅ Prima riga: "gg-" (es. "14-")
- ✅ Seconda riga: "gg Mese" (es. "20 Ott")
- ✅ Font size ridotto a 10px per leggibilità
- ✅ Height asse X aumentato a **50px**
- ✅ Bottom margin aumentato a **30px**
- ✅ CardContent padding bottom aumentato a **pb-8**
- ✅ Aumentata altezza grafico a **300px**
- ✅ Migliorati dot della linea: r=5, stroke bianco, strokeWidth=2
- ✅ Stroke line aumentato a 2.5px per maggiore visibilità
- ✅ Tooltip migliorato con "candidatura/candidature" al singolare/plurale
- ✅ `interval={0}` per mostrare tutte le settimane

**Codice Custom Tick**:
```typescript
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const parts = payload.value.split('-');

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fill="#6B7280" fontSize={10}>
        {parts.length > 1 ? (
          <>
            <tspan x="0" dy="0">{parts[0]}-</tspan>
            <tspan x="0" dy="12">{parts[1]}</tspan>
          </>
        ) : (
          payload.value
        )}
      </text>
    </g>
  );
};
```

## Miglioramenti Visivi

### TopSkillsChart
- **Margini**: top: 10, right: 30, left: 5, bottom: 10
- **Y-axis width**: 180px
- **Height totale**: 300px
- **Tooltip**: max-width, break-words per nomi lunghi
- **LabelList**: numeri chiari a destra barre

### ApplicationsTimelineChart
- **Margini**: top: 15, right: 20, left: 0, bottom: **50px** ⬆️
- **X-axis height**: **60px** ⬆️
- **Height totale**: **320px** ⬆️
- **CardContent pb**: **pb-10** ⬆️
- **Custom tick dy**: **20** (distanza dal grafico) ⬆️
- **Tspan dy**: **13** (spaziatura tra righe) ⬆️
- **Line stroke**: 2.5px (più visibile)
- **Dots**: r=5, bordo bianco

## Testing

✅ Skills con nomi lunghi (>20 caratteri) → troncati con "..."
✅ Hover su skills → tooltip mostra nome completo
✅ Timeline 8 settimane → tutte visibili su due righe
✅ **Labels timeline ben distanziate dal grafico** ⬆️
✅ Grafici responsive → leggibili su mobile/tablet/desktop
✅ Skeleton states → aggiornati (timeline 320px, skills 300px)

## File Modificati

1. `src/components/charts/TopSkillsChart.tsx`
   - Custom Y-axis tick
   - Truncate logic
   - LabelList
   - Dimensioni ottimizzate

2. `src/components/charts/ApplicationsTimelineChart.tsx`
   - Custom X-axis tick multi-linea
   - Spacing ottimizzato
   - Dots e stroke migliorati

3. `src/app/dashboard/company/page.tsx`
   - Skeleton height aggiornati a 300px

## Risultato

✅ **Tutti i testi sono completamente visibili**
✅ **Assi etichettati chiaramente**
✅ **Layout pulito e professionale**
✅ **Grafici leggibili e informativi**

## Note Tecniche

- Custom tick components usano SVG `<g>` e `<text>`
- `textAnchor` controlla allineamento testo
- `tspan` permette testo multi-linea
- `dy` offset verticale tra righe
- `interval={0}` forza visualizzazione tutte le label
- Height maggiorato compensa spazio custom ticks
