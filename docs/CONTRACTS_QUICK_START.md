# 🚀 Quick Start - Contratti AI

Guida rapida per iniziare subito a generare contratti con AI.

## ✅ Checklist Pre-Deploy

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Verifica Environment Variables
Controlla che `.env.local` sia configurato:
```bash
cat .env.local | grep FIREBASE
```

Deve mostrare:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
...
```

### 3. Build & Test Locale
```bash
npm run build
npm run dev
```

Apri [http://localhost:9002](http://localhost:9002)

## 🎯 Primo Contratto - Tutorial

### Step 1: Setup Dati Test

1. **Crea un utente Admin** (se non esiste):
   - Vai su Firebase Console > Authentication
   - Crea/Modifica un utente
   - Vai su Firestore > `users` collection
   - Trova il documento con quell'UID
   - Setta `role: "admin"`

2. **Crea una Application di test** in fase colloquio:
   - Vai su Firestore > `jobs` collection
   - Scegli un job esistente
   - Vai nella subcollection `applications`
   - Trova un'application e setta:
     ```json
     {
       "status": "colloquio_accettato_prof",
       "professionalId": "uid_professionista_esistente",
       "companyId": "uid_azienda_esistente"
     }
     ```

### Step 2: Accesso Dashboard Contratti

1. **Login come Admin**:
   ```
   http://localhost:9002/login
   ```

2. **Vai alla Dashboard Contratti**:
   ```
   http://localhost:9002/dashboard/admin/contracts
   ```

3. Dovresti vedere:
   - Sezione "Candidature in Fase Colloquio (Senza Contratto)"
   - Almeno 1 candidatura nella tabella

### Step 3: Genera il Primo Contratto

1. **Click su "Genera Contratto"** sulla candidatura

2. **Compila il form** (esempio con dati fittizi):

#### Dati Professionista
```
Nome Completo: Mario Rossi
Partita IVA: 12345678901
Codice Fiscale: RSSMRA80A01H501Z
Regime Fiscale: Forfettario
Indirizzo: Via Roma 1, Milano MI
```

#### Dati Azienda
```
Ragione Sociale: Tech Build SRL
Partita IVA: 98765432101
Sede Legale: Via Dante 10, Milano MI
Rappresentante Legale: Giuseppe Verdi
```

#### Dettagli Progetto
```
Data Inizio: 2025-11-01
Data Fine: 2026-01-31
Modalità Lavoro: Remoto
Deliverables (uno per riga):
Modello BIM architettonico LOD 300 formato IFC
Elaborati grafici 2D estratti da modello
Clash detection report
Computo metrico quantità
```

#### Pagamento
```
Importo Totale: 8000
Termini Pagamento: 30 giorni dalla fattura
```

#### Condizioni Speciali
- [ ] NDA Richiesto
- [ ] Assicurazione RC Obbligatoria
- [ ] Spese viaggio a carico committente

3. **Click "Genera Contratto"**

4. **Attendi 10-15 secondi** (vedi progress indicator)

5. **Success!** Dovresti vedere:
   - ✅ "Contratto generato con successo!"
   - Contract ID mostrato
   - Modal si chiude automaticamente

### Step 4: Visualizza Contratto Generato

1. **Refresh della pagina** (o attendi auto-refresh)

2. **Nella sezione "Contratti Generati"** dovresti vedere:
   - Il contratto appena creato
   - Status: "Generato" (badge blu)
   - Importo: €8.000
   - Data generazione: Oggi

3. **Click "Visualizza"**:
   - Si apre il viewer
   - Vedi tutto il testo del contratto
   - Metadata AI (model, word count, etc.)

4. **Testa le azioni**:
   - Click "Stampa" → Si apre dialog di stampa browser
   - Click "Scarica PDF" → (Non ancora implementato)

## 🐛 Troubleshooting Quick Fixes

### Errore: "Application not found"
**Causa**: ApplicationId o JobId non validi.
**Fix**:
```javascript
// Verifica su Firestore Console
jobs/{jobId}/applications/{applicationId}
```

### Errore: "Application must be in interview stage"
**Causa**: Status application non è colloquio.
**Fix**:
```javascript
// Su Firestore, cambia status a:
"colloquio_accettato_prof"
```

### Errore: "Professional or Company profile not found"
**Causa**: UID non esistenti in `users` collection.
**Fix**:
```javascript
// Verifica su Firestore che esistano:
users/{professionalId}
users/{companyId}
```

### Contratto non si genera (timeout)
**Causa**: Gemini API slow o error.
**Fix**:
1. Controlla console browser (F12)
2. Controlla console server (terminal)
3. Verifica quota Gemini su Google Cloud Console
4. Riprova dopo 1 minuto

### Errore: "Contratto generato incompleto"
**Causa**: Validazione fallita (manca articolo obbligatorio).
**Fix**:
1. Leggi l'errore per capire cosa manca
2. Compila meglio i campi "Deliverables" e "Description"
3. Riprova generazione

## 🔍 Debugging Avanzato

### 1. Abilita Log Dettagliati

Nel file `src/app/api/contracts/generate/route.ts`, i log sono già abilitati:
```typescript
console.log('[API /contracts/generate] Starting...');
console.log('[API /contracts/generate] Calling Genkit flow...');
// ...
```

Monitora il terminal dove gira `npm run dev`.

### 2. Testa il Genkit Flow Direttamente

```bash
npm run genkit:dev
```

Apri [http://localhost:4000](http://localhost:4000) (Genkit UI).

Trova il flow `generateContract` e testalo con input JSON:
```json
{
  "professional": {
    "uid": "test",
    "email": "test@test.com",
    "displayName": "Mario Rossi",
    "role": "professional",
    "firstName": "Mario",
    "lastName": "Rossi",
    "bimSkills": ["modellazione-architettonica"],
    "softwareProficiency": ["autodesk-revit"]
  },
  "company": {
    "uid": "test2",
    "email": "company@test.com",
    "displayName": "Tech SRL",
    "role": "company",
    "companyName": "Tech SRL",
    "companyVat": "12345678901"
  },
  "project": {
    "title": "Test Project",
    "description": "Test description",
    "requiredSkills": ["revit"],
    "requiredSoftware": ["revit"],
    "projectType": "consulenza",
    "location": "Milano"
  },
  "contractData": {
    "professional": {
      "name": "Mario Rossi",
      "piva": "12345678901",
      "fiscalCode": "RSSMRA80A01H501Z",
      "taxRegime": "forfettario",
      "address": "Via Roma 1, Milano"
    },
    "company": {
      "businessName": "Tech SRL",
      "piva": "98765432101",
      "address": "Via Dante 10, Milano",
      "legalRepresentative": "Giuseppe Verdi"
    },
    "project": {
      "title": "Test",
      "description": "Test",
      "deliverables": ["Modello BIM"],
      "duration": "2 mesi",
      "startDate": "2025-11-01",
      "endDate": "2025-12-31",
      "workMode": "remoto"
    },
    "payment": {
      "totalAmount": 5000,
      "currency": "EUR",
      "paymentTerms": "30 giorni"
    }
  }
}
```

### 3. Verifica Firestore Rules

```bash
firebase firestore:rules:get
```

Assicurati che le regole per `contracts` siano presenti.

## 📊 Metriche di Successo

Dopo aver generato il primo contratto, verifica:

### Firestore
- ✅ Documento creato in `contracts/{contractId}`
- ✅ Application aggiornata con `contractId` e `contractStatus: 'generated'`
- ✅ Timestamps popolati correttamente

### UI
- ✅ Contratto visibile nella lista
- ✅ Viewer mostra testo completo
- ✅ Metadata AI corretti (model, wordCount, articleCount)

### Contratto
- ✅ Almeno 10 articoli numerati
- ✅ Almeno 1000 parole
- ✅ Tutte le sezioni presenti (Firme, GDPR, IP, etc.)
- ✅ Importi e date corretti
- ✅ Regime fiscale applicato correttamente

## 🎉 Success! Cosa Fare Ora?

### 1. Testa Altri Scenari
- Genera contratto con NDA attivato
- Genera contratto con milestone pagamento
- Genera contratto ordinario (non forfettario)

### 2. Personalizza il Prompt
- Edita `src/ai/prompts/contractPrompt.ts`
- Aggiungi clausole personalizzate
- Testa le modifiche

### 3. Estendi le Funzionalità
- Implementa PDF generation
- Aggiungi email notifications
- Crea template personalizzati

### 4. Deploy in Produzione
```bash
npm run build
firebase deploy
```

## 📚 Prossimi Step

Leggi la documentazione completa:
- **Guida completa**: `docs/CONTRACTS_AI_GUIDE.md`
- **Summary tecnico**: `docs/CONTRACTS_AI_IMPLEMENTATION_SUMMARY.md`

## 💡 Tips & Best Practices

### Compilare il Form
- **P.IVA**: Sempre 11 cifre
- **Codice Fiscale**: Sempre 16 caratteri
- **Deliverables**: Uno per riga, specifici e misurabili
- **Importo**: Realistico rispetto alla durata (es. €2000-€10000 per 2-3 mesi)

### Quando Attivare NDA
- Progetti con dati sensibili
- Tecnologie innovative
- Grandi committenti

### Quando Richiedere Assicurazione
- Importo > €10.000
- Responsabilità strutturale
- Progetti complessi

### Milestone Pagamento
Usale per progetti:
- Durata > 2 mesi
- Importo > €5.000
- Con fasi distinte

---

**Buona generazione di contratti! 🎉**

Se hai problemi, apri un issue o consulta la guida completa.
