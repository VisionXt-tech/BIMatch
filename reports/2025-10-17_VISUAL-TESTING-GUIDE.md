# Visual Testing Guide - Company Dashboard Charts

**Data**: 2025-10-17
**Obiettivo**: Verificare visualmente i grafici della dashboard company

## URL da Testare

```
http://localhost:9002/dashboard/company
```

## Checklist Visual Test

### 1. TopSkillsChart (Skills Più Richieste)

**Elementi da Verificare**:
- [ ] Labels Y-axis completamente visibili (no truncation)
- [ ] Nomi skills max 20 caratteri + "..." se troncati
- [ ] Hover mostra tooltip con nome completo
- [ ] Numeri a destra delle barre chiari e leggibili
- [ ] 5 barre colorate (gradient teal)
- [ ] Spazio sufficiente tra barre e bordo card

**Dimensioni Attese**:
- Y-axis width: 180px
- Chart height: 300px
- Font labels: 11px

### 2. ApplicationsTimelineChart (Candidature Ultime 8 Settimane)

**Elementi da Verificare**:
- [ ] Labels X-axis su due righe ben distanziate
- [ ] Prima riga: "gg-" (es. "14-")
- [ ] Seconda riga: "gg Mese" (es. "20 Ott")
- [ ] **SPAZIO CHIARO tra labels e grafico linea** ⭐
- [ ] 8 settimane tutte visibili
- [ ] Dots sulla linea ben visibili (r=5, bordo bianco)
- [ ] Linea spessore 2.5px
- [ ] Hover mostra tooltip con "candidatura/candidature"

**Dimensioni Attese**:
- Chart height: 320px
- X-axis height: 60px
- Bottom margin: 50px
- Custom tick dy: 20 (distanza dal grafico)

### 3. Progetti Recenti

**Elementi da Verificare**:
- [ ] Lista ultimi 3 progetti
- [ ] Titolo, località, data visibili
- [ ] Badge status colorati
- [ ] Hover border teal
- [ ] Link "Vedi Tutti" funzionante

### 4. Empty State

**Elementi da Verificare**:
- [ ] Icona BarChart3
- [ ] Messaggio chiaro
- [ ] CTA "Pubblica Progetto"

## Come Testare

### Opzione 1: Browser Manuale
1. Apri `http://localhost:9002`
2. Login come company
3. Vai su dashboard
4. Verifica ogni elemento della checklist
5. Screenshot per confronto

### Opzione 2: Playwright Script

```typescript
// test-dashboard-charts.spec.ts
import { test, expect } from '@playwright/test';

test('Company Dashboard Charts', async ({ page }) => {
  // Login
  await page.goto('http://localhost:9002/login');
  // ... login flow ...

  // Go to dashboard
  await page.goto('http://localhost:9002/dashboard/company');

  // Wait for charts to load
  await page.waitForSelector('[class*="recharts-wrapper"]');

  // Screenshot full dashboard
  await page.screenshot({
    path: 'screenshots/company-dashboard-full.png',
    fullPage: true
  });

  // Screenshot skills chart
  const skillsChart = page.locator('text=Skills Più Richieste').locator('..');
  await skillsChart.screenshot({
    path: 'screenshots/skills-chart.png'
  });

  // Screenshot timeline chart
  const timelineChart = page.locator('text=Candidature Ultime 8 Settimane').locator('..');
  await timelineChart.screenshot({
    path: 'screenshots/timeline-chart.png'
  });

  // Check Y-axis labels visible (TopSkills)
  const yAxisLabels = await page.locator('.recharts-yAxis .recharts-text').all();
  for (const label of yAxisLabels) {
    const isVisible = await label.isVisible();
    expect(isVisible).toBe(true);
  }

  // Check X-axis labels spacing (Timeline)
  const xAxisLabels = await page.locator('.recharts-xAxis .recharts-text').all();
  expect(xAxisLabels.length).toBeGreaterThan(0);
});
```

### Opzione 3: DevTools Inspector
1. Apri DevTools (F12)
2. Ispeziona elemento SVG del grafico
3. Verifica:
   - `<YAxis width="180">`
   - `<XAxis height="60">`
   - Custom tick `dy="20"`
   - Margins: `top: 15, bottom: 50`

## Metriche di Successo

✅ **TopSkillsChart**:
- 0 labels troncate visivamente
- Tooltip funzionante
- LabelList numeri visibili

✅ **ApplicationsTimelineChart**:
- Labels ben distanziate (>20px dal grafico)
- Tutte le 8 settimane visibili
- Nessuna sovrapposizione testo

## Screenshot da Raccogliere

1. `company-dashboard-full.png` - Vista completa
2. `skills-chart-detail.png` - Zoom su TopSkillsChart
3. `timeline-chart-detail.png` - Zoom su ApplicationsTimelineChart
4. `timeline-labels-spacing.png` - Focus su distanza labels-grafico

## Problemi Comuni da Verificare

❌ **Se labels ancora tagliate**:
- Controllare `width` Y-axis in DevTools
- Verificare `padding-left` card content
- Aumentare ulteriormente width

❌ **Se labels timeline troppo vicine**:
- Controllare `dy` del custom tick
- Verificare `bottom` margin del chart
- Aumentare `height` X-axis

## Next Steps se OK

✅ Grafici perfetti → Chiudere issue
✅ Documentare in CHANGELOG
✅ Deploy in staging per test finale
