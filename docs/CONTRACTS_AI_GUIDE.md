# Guida Contratti AI - BIMatch

## Panoramica

Il sistema di **Contratti AI** permette agli amministratori di BIMatch di generare contratti di collaborazione personalizzati utilizzando Gemini AI. I contratti sono formalmente validi, conformi alla normativa italiana e specifici per il settore BIM/AEC.

## Funzionalità

- ✅ Generazione automatica contratti con Gemini 2.0 Flash
- ✅ Prompt engineering specializzato per contratti BIM/AEC
- ✅ Validazione automatica del contenuto generato
- ✅ Gestione regime fiscale (Forfettario, Ordinario, Semplificato)
- ✅ Clausole speciali (NDA, Assicurazione RC, Spese viaggio)
- ✅ Milestone di pagamento configurabili
- ✅ Visualizzazione e gestione contratti generati
- ✅ Firestore security rules con accesso limitato

## Prerequisiti

### 1. Configurazione Gemini AI

Il progetto utilizza già Genkit con Gemini. Assicurati di avere:

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... altre variabili Firebase
```

Gemini API è automaticamente accessibile tramite Firebase/Google Cloud.

### 2. Firestore Security Rules

Le regole di sicurezza sono già configurate in `firestore.rules`:

```javascript
// Contratti - Solo admin può creare, parti coinvolte possono leggere
match /contracts/{contractId} {
  allow read: if isAuthenticated() &&
    (hasRole('admin') ||
     resource.data.professionalId == request.auth.uid ||
     resource.data.companyId == request.auth.uid);

  allow create: if hasRole('admin');
  allow update, delete: if hasRole('admin');
}
```

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Architettura

```
src/
├── types/
│   └── contract.ts                    # Type definitions
├── ai/
│   ├── genkit.ts                      # Genkit config
│   ├── prompts/
│   │   └── contractPrompt.ts          # Prompt builder
│   └── flows/
│       └── generateContractFlow.ts    # Genkit flow
├── app/
│   ├── api/
│   │   └── contracts/
│   │       └── generate/
│   │           └── route.ts           # API endpoint
│   └── dashboard/
│       └── admin/
│           └── contracts/
│               └── page.tsx           # Admin UI
└── components/
    └── admin/
        ├── ContractGenerationModal.tsx
        └── ContractViewer.tsx
```

## Utilizzo

### 1. Accesso alla Dashboard Contratti

Come admin, accedi a:
```
/dashboard/admin/contracts
```

### 2. Generare un Contratto

1. **Trova una candidatura in fase colloquio** senza contratto esistente
2. Clicca su **"Genera Contratto"**
3. **Compila il form** con i dati richiesti:

#### Dati Professionista
- Nome completo
- Partita IVA *
- Codice Fiscale *
- Regime fiscale (Forfettario/Ordinario/Semplificato)
- Indirizzo

#### Dati Azienda
- Ragione sociale
- Partita IVA *
- Sede legale
- Rappresentante legale

#### Dettagli Progetto
- Date inizio/fine
- Modalità lavoro (Remoto/Ibrido/Presenza)
- Deliverables (elenco)

#### Pagamento
- Importo totale (€)
- Termini di pagamento
- Milestone (opzionale)

#### Condizioni Speciali
- [ ] NDA richiesto
- [ ] Assicurazione RC obbligatoria
- [ ] Spese viaggio a carico committente

4. Clicca **"Genera Contratto"**
5. Attendi la generazione (5-15 secondi)
6. Visualizza il contratto generato

### 3. Visualizzare Contratti Esistenti

Nella sezione **"Contratti Generati"** puoi:
- Vedere tutti i contratti creati
- Filtrare per stato
- Aprire la visualizzazione dettagliata
- Stampare il contratto
- (Futuro) Scaricare PDF

## Struttura Contratto Generato

Il contratto include obbligatoriamente:

### Sezioni Standard
1. **Intestazione** - Titolo e data
2. **Premesse** - Identificazione parti e contesto
3. **Articoli numerati** (minimo 10):
   - Art. 1 - Oggetto del Contratto
   - Art. 2 - Durata
   - Art. 3 - Corrispettivo e Pagamento
   - Art. 4 - Obblighi Collaboratore
   - Art. 5 - Obblighi Committente
   - Art. 6 - Proprietà Intellettuale
   - Art. 7 - Riservatezza
   - Art. 8 - Trattamento Dati GDPR
   - Art. 9 - Natura del Rapporto
   - Art. 10 - Responsabilità e Garanzie
   - Art. 11 - Risoluzione e Recesso
   - Art. 12 - Variazioni
   - Art. 13 - Spese
   - Art. 14 - Foro Competente
   - Art. 15 - Clausole Finali
4. **Firme** - Sezione per firma digitale

### Validazioni Automatiche

Il sistema verifica che il contratto contenga:
- ✅ Partite IVA e Codici Fiscali
- ✅ Importi e termini pagamento
- ✅ Date di durata
- ✅ Clausola recesso
- ✅ GDPR compliance
- ✅ Proprietà intellettuale
- ✅ Almeno 10 articoli
- ✅ Minimo 1000 parole

## API Endpoint

### POST /api/contracts/generate

Genera un nuovo contratto.

**Request Body:**
```typescript
{
  applicationId: string;
  jobId: string;
  adminUid: string;
  contractData: ContractData;
}
```

**Response:**
```typescript
{
  success: true,
  contractId: string,
  contractText: string,
  metadata: {
    model: string,
    promptVersion: string,
    generatedAt: string,
    wordCount: number,
    articleCount: number
  }
}
```

**Errori:**
- `400` - Dati mancanti o non validi
- `404` - Application o progetto non trovato
- `500` - Errore generazione AI

## Sicurezza

### Autenticazione
- Solo utenti con `role: 'admin'` possono generare contratti
- API verifica il `adminUid` passato

### Autorizzazioni Firestore
- **Creazione**: Solo admin
- **Lettura**: Admin + parti coinvolte (professionista/azienda)
- **Modifica/Eliminazione**: Solo admin

### Audit Logging
Ogni generazione di contratto crea un audit log con:
- UID admin che ha generato
- Timestamp
- IDs application/job/contratto

## Configurazione Avanzata

### Personalizzare il Prompt

Modifica `src/ai/prompts/contractPrompt.ts`:

```typescript
export function buildContractPrompt(
  professional: ProfessionalProfile,
  company: CompanyProfile,
  project: Project,
  contractData: ContractData
): string {
  // Modifica il prompt qui
  return `Sei un avvocato specializzato...`;
}
```

### Modificare Parametri Gemini

Modifica `src/ai/flows/generateContractFlow.ts`:

```typescript
const response = await ai.generate({
  model: 'googleai/gemini-2.0-flash',
  prompt: prompt,
  config: {
    temperature: 0.3,      // ← Modifica qui
    maxOutputTokens: 8000, // ← Aumenta per contratti più lunghi
    topK: 20,
    topP: 0.8,
  },
});
```

## Troubleshooting

### Errore: "Application must be in interview stage"
**Causa:** L'application non è in stato colloquio.
**Soluzione:** Assicurati che lo stato sia `colloquio_proposto`, `colloquio_accettato_prof` o `colloquio_ripianificato_prof`.

### Errore: "Contratto generato incompleto"
**Causa:** La validazione ha fallito (mancano elementi obbligatori).
**Soluzione:**
1. Controlla i log per vedere cosa manca
2. Verifica che tutti i campi richiesti siano compilati
3. Se persiste, modifica il prompt per enfatizzare gli elementi mancanti

### Errore: "Genkit flow failed"
**Causa:** Problema con Gemini API.
**Soluzione:**
1. Verifica che Genkit sia configurato correttamente
2. Controlla le quote API Google Cloud
3. Verifica i log: `npm run genkit:dev`

### Contratto troppo breve
**Causa:** Il prompt non è sufficientemente dettagliato.
**Soluzione:** Aggiungi più informazioni in `contractData.project.description` e `deliverables`.

## Limiti Attuali

- ⚠️ **No PDF generation** - Solo testo formattato (implementazione futura)
- ⚠️ **No firme digitali** - Previsto per versione 2.0
- ⚠️ **No milestone tracking** - Solo definizione nel contratto
- ⚠️ **No versioning automatico** - Revisioni manuali

## Roadmap Futura

### V1.1 (Prossima release)
- [ ] Generazione PDF con pdfkit
- [ ] Download PDF
- [ ] Email automatica alle parti

### V2.0
- [ ] Firma digitale elettronica
- [ ] Escrow pagamenti con Stripe
- [ ] Versioning automatico contratti
- [ ] Template personalizzabili

### V3.0
- [ ] OCR per contratti cartacei
- [ ] AI per analisi clausole esistenti
- [ ] Dashboard analytics contratti

## Supporto

Per domande o problemi:
1. Controlla i log della console browser e server
2. Verifica le Firestore rules
3. Controlla che Genkit sia in esecuzione: `npm run genkit:dev`
4. Leggi i log di errore nell'API route

## Esempi di Uso

### Caso 1: Consulenza Remota Breve

```typescript
contractData = {
  professional: {
    taxRegime: 'forfettario',
    // ...
  },
  project: {
    duration: '2 mesi',
    workMode: 'remoto',
    deliverables: ['Modello BIM LOD 300', 'Report clash detection']
  },
  payment: {
    totalAmount: 5000,
    paymentTerms: '30 giorni dalla fattura'
  },
  specialConditions: {
    ndaRequired: false,
    insuranceRequired: false
  }
}
```

### Caso 2: Progetto Complesso con NDA

```typescript
contractData = {
  professional: {
    taxRegime: 'ordinario',
    // ...
  },
  project: {
    duration: '6 mesi',
    workMode: 'ibrido',
    deliverables: [
      'BEP - BIM Execution Plan',
      'Modello federato coordinato',
      'Documentazione tecnica completa',
      'Formazione personale committente'
    ]
  },
  payment: {
    totalAmount: 35000,
    paymentTerms: '30 giorni dalla fattura',
    milestones: [
      { phase: 'Kick-off e BEP', percentage: 20, amount: 7000 },
      { phase: 'Modellazione 50%', percentage: 30, amount: 10500 },
      { phase: 'Coordinamento e clash', percentage: 30, amount: 10500 },
      { phase: 'Consegna finale', percentage: 20, amount: 7000 }
    ]
  },
  specialConditions: {
    ndaRequired: true,           // ← Clausola rinforzata
    insuranceRequired: true,     // ← RC obbligatoria
    travelExpenses: true,
    equipmentProvided: false
  }
}
```

## Best Practices

### 1. Sempre Verificare i Dati
Prima di generare, controlla che:
- P.IVA e CF siano formalmente corretti (11 cifre P.IVA, 16 caratteri CF)
- Date siano coerenti (inizio < fine)
- Importo sia realistico rispetto alla durata
- Deliverables siano specifici e misurabili

### 2. Usare Descrizioni Dettagliate
Più dettagli dai nel form, migliore sarà il contratto:
```typescript
// ❌ Male
deliverables: ['Modello BIM']

// ✅ Bene
deliverables: [
  'Modello BIM architettonico LOD 300 formato IFC',
  'Elaborati grafici 2D estratti da modello',
  'Computo metrico con quantità estratte',
  'Relazione tecnica di coordinamento'
]
```

### 3. NDA e Assicurazione
Attiva NDA per progetti:
- Con dati sensibili
- Per clienti internazionali
- Con tecnologie innovative

Richiedi assicurazione per progetti:
- Con importo > €10.000
- Con responsabilità strutturale
- Per grandi committenti

### 4. Milestone
Definisci milestone per progetti:
- Durata > 2 mesi
- Importo > €5.000
- Con fasi di lavoro distinte

```typescript
milestones: [
  { phase: 'Inizio lavori', percentage: 30, amount: 1500 },
  { phase: 'Consegna intermedia', percentage: 40, amount: 2000 },
  { phase: 'Consegna finale', percentage: 30, amount: 1500 }
]
```

---

**Versione:** 1.0
**Ultimo aggiornamento:** Ottobre 2025
**Autore:** BIMatch Development Team
