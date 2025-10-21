# Campi Obbligatori per Generazione Contratti AI

## Panoramica

Per generare contratti con AI, i **profili utente** e i **progetti** devono contenere informazioni fiscali e contrattuali complete. Questa guida elenca i campi obbligatori e consigliati.

---

## 📋 Profilo Professionista

### Campi OBBLIGATORI (per contratti)

| Campo | Tipo | Esempio | Note |
|-------|------|---------|------|
| `firstName` | string | "Mario" | Nome |
| `lastName` | string | "Rossi" | Cognome |
| `fiscalCode` | string | "RSSMRA80A01H501Z" | 16 caratteri |
| `partitaIva` | string | "12345678901" | 11 cifre |
| `taxRegime` | enum | "forfettario" | ordinario/forfettario/semplificato |
| `fiscalAddress` | string | "Via Roma 1, 20100 Milano MI" | Indirizzo completo con CAP |
| `email` | string | "mario@example.com" | Email professionale |

### Campi CONSIGLIATI

| Campo | Descrizione |
|-------|-------------|
| `fiscalCity` | Città sede fiscale (es. "Milano") |
| `fiscalCAP` | CAP (es. "20100") |
| `fiscalProvince` | Provincia (es. "MI") |
| `bimSkills` | Array di competenze BIM |
| `softwareProficiency` | Software conosciuti |
| `experienceLevel` | Livello esperienza |

### Esempio JSON Firestore

```json
{
  "uid": "abc123",
  "role": "professional",
  "firstName": "Mario",
  "lastName": "Rossi",
  "email": "mario.rossi@example.com",
  "fiscalCode": "RSSMRA80A01H501Z",
  "partitaIva": "12345678901",
  "taxRegime": "forfettario",
  "fiscalAddress": "Via Roma 1, 20100 Milano MI",
  "fiscalCity": "Milano",
  "fiscalCAP": "20100",
  "fiscalProvince": "MI",
  "bimSkills": ["modellazione-architettonica", "clash-detection"],
  "softwareProficiency": ["autodesk-revit"],
  "experienceLevel": "senior-5-8"
}
```

---

## 🏢 Profilo Azienda

### Campi OBBLIGATORI (per contratti)

| Campo | Tipo | Esempio | Note |
|-------|------|---------|------|
| `companyName` | string | "Tech Build SRL" | Ragione sociale |
| `companyVat` | string | "98765432101" | P.IVA 11 cifre |
| `legalAddress` | string | "Via Dante 10, 20100 Milano MI" | Sede legale completa |
| `legalRepresentative` | string | "Giuseppe Verdi" | Nome completo |
| `contactEmail` | string | "info@techbuild.it" | Email aziendale |

### Campi CONSIGLIATI

| Campo | Descrizione |
|-------|-------------|
| `legalCity` | Città sede legale |
| `legalCAP` | CAP sede legale |
| `legalProvince` | Provincia |
| `legalRepresentativeRole` | Ruolo (es. "Amministratore Delegato") |
| `contactPerson` | Referente per il progetto |
| `contactPhone` | Telefono aziendale |

### Esempio JSON Firestore

```json
{
  "uid": "xyz789",
  "role": "company",
  "companyName": "Tech Build SRL",
  "companyVat": "98765432101",
  "email": "info@techbuild.it",
  "legalAddress": "Via Dante 10, 20100 Milano MI",
  "legalCity": "Milano",
  "legalCAP": "20100",
  "legalProvince": "MI",
  "legalRepresentative": "Giuseppe Verdi",
  "legalRepresentativeRole": "Amministratore Delegato",
  "contactEmail": "info@techbuild.it",
  "contactPerson": "Laura Bianchi",
  "contactPhone": "+39 02 1234567",
  "industry": "architecture"
}
```

---

## 📁 Progetto

### Campi OBBLIGATORI (per contratti)

| Campo | Tipo | Esempio | Note |
|-------|------|---------|------|
| `title` | string | "Modellazione BIM Torre Milano" | Titolo progetto |
| `description` | string | "Sviluppo modello BIM..." | Descrizione dettagliata |
| `deliverables` | string[] | ["Modello BIM LOD 300", "Clash detection"] | Lista output |
| `budgetAmount` | number | 8000 | Importo in euro |
| `startDate` | string | "2025-11-01" | YYYY-MM-DD |
| `endDate` | string | "2026-01-31" | YYYY-MM-DD |
| `workMode` | enum | "remoto" | remoto/ibrido/presenza |
| `duration` | string | "3 mesi" | Durata leggibile |

### Campi CONSIGLIATI

| Campo | Descrizione |
|-------|-------------|
| `paymentTerms` | Termini pagamento (es. "30 giorni dalla fattura") |
| `paymentMilestones` | Array milestone pagamento |
| `specialConditions.ndaRequired` | NDA richiesto (boolean) |
| `specialConditions.insuranceRequired` | Assicurazione obbligatoria (boolean) |
| `specialConditions.travelExpenses` | Spese viaggio rimborsabili (boolean) |
| `requiredSkills` | Competenze richieste |
| `requiredSoftware` | Software necessari |

### Esempio JSON Firestore

```json
{
  "id": "project123",
  "title": "Modellazione BIM Torre Milano",
  "description": "Sviluppo completo modello BIM architettonico LOD 300 per edificio commerciale di 15 piani...",
  "companyId": "xyz789",
  "companyName": "Tech Build SRL",
  "location": "Milano, Lombardia",

  "deliverables": [
    "Modello BIM architettonico LOD 300 formato IFC",
    "Elaborati grafici 2D estratti da modello",
    "Clash detection report con risoluzione interferenze",
    "Computo metrico quantità"
  ],

  "budgetAmount": 8000,
  "budgetCurrency": "EUR",
  "startDate": "2025-11-01",
  "endDate": "2026-01-31",
  "duration": "3 mesi",
  "workMode": "remoto",
  "paymentTerms": "30 giorni dalla fattura",

  "paymentMilestones": [
    {
      "phase": "Kick-off e BEP",
      "percentage": 30,
      "amount": 2400,
      "description": "Pagamento all'inizio lavori"
    },
    {
      "phase": "Modellazione 50%",
      "percentage": 40,
      "amount": 3200,
      "description": "Pagamento a metà progetto"
    },
    {
      "phase": "Consegna finale",
      "percentage": 30,
      "amount": 2400,
      "description": "Pagamento alla consegna approvata"
    }
  ],

  "specialConditions": {
    "ndaRequired": true,
    "insuranceRequired": false,
    "travelExpenses": false,
    "equipmentProvided": false
  },

  "requiredSkills": ["modellazione-architettonica", "clash-detection"],
  "requiredSoftware": ["autodesk-revit"],
  "projectType": "Consulenza BIM",
  "status": "attivo"
}
```

---

## ⚠️ Validazione Pre-Generazione

Prima di cliccare "Genera Contratto", il sistema verificherà:

### Professionista
- ✅ P.IVA presente (11 cifre)
- ✅ Codice Fiscale presente (16 caratteri)
- ✅ Indirizzo fiscale completo
- ✅ Regime fiscale impostato

### Azienda
- ✅ P.IVA azienda presente
- ✅ Sede legale completa
- ✅ Rappresentante legale presente

### Progetto
- ✅ Date inizio/fine presenti
- ✅ Almeno 1 deliverable
- ✅ Importo > 0

Se mancano dati, il sistema mostrerà un errore specifico tipo:
- ❌ "P.IVA del professionista mancante. Aggiornare il profilo professionista."
- ❌ "Deliverables mancanti. Aggiornare il progetto o inserirli manualmente."

---

## 🔒 Privacy e Visibilità

### Dati NON Pubblici (solo profilo privato)
- ❌ `fiscalCode` - Solo proprietario e admin
- ❌ `partitaIva` - Solo proprietario e admin
- ❌ `fiscalAddress` - Solo proprietario e admin
- ❌ `companyVat` - Solo proprietario e admin
- ❌ `legalAddress` - Solo proprietario e admin

### Dati Pubblici (marketplace)
- ✅ `firstName`, `lastName` (professional)
- ✅ `companyName` (company)
- ✅ `bimSkills`, `softwareProficiency`
- ✅ `experienceLevel`
- ✅ `location` (città/regione, non indirizzo completo)
- ✅ `budgetRange` (range, non importo esatto)

### Dati Semi-Pubblici (solo in fase contratto)
- 🔐 `budgetAmount` - Visibile solo a parti coinvolte
- 🔐 `deliverables` dettagliati - Visibile solo a parti coinvolte
- 🔐 `paymentMilestones` - Visibile solo a parti coinvolte

---

## 📝 Checklist per Admin

Prima di generare contratti, assicurati che:

### Setup Professionista
- [ ] Professionista ha compilato dati fiscali nel profilo
- [ ] P.IVA e CF verificati (formato corretto)
- [ ] Indirizzo fiscale completo
- [ ] Regime fiscale selezionato

### Setup Azienda
- [ ] Azienda ha compilato dati legali nel profilo
- [ ] P.IVA verificata
- [ ] Sede legale completa
- [ ] Rappresentante legale inserito

### Setup Progetto
- [ ] Deliverables specifici elencati
- [ ] Date inizio/fine definite
- [ ] Importo preciso (non solo range)
- [ ] Modalità lavoro specificata
- [ ] Condizioni speciali configurate (se necessarie)

---

## 🚀 Prossimi Step

Per implementare completamente questa feature:

1. **Aggiornare form registrazione professionista**
   - Aggiungere campi P.IVA, CF, Regime fiscale, Indirizzo
   - Validazione formato (11 cifre P.IVA, 16 caratteri CF)

2. **Aggiornare form profilo azienda**
   - Aggiungere campo Rappresentante legale
   - Aggiungere Sede legale (separata da sede operativa)

3. **Aggiornare form creazione progetto**
   - Aggiungere sezione "Dettagli Contratto"
   - Deliverables (textarea, uno per riga)
   - Importo preciso
   - Date inizio/fine
   - Modalità lavoro (radio buttons)
   - Condizioni speciali (checkboxes)
   - Milestone pagamento (opzionale, form dinamico)

4. **Privacy settings**
   - Nascondere dati fiscali nel marketplace
   - Mostrare solo a proprietario e admin
   - Firestore rules aggiornate

---

**Versione:** 1.0
**Data:** Ottobre 2025
**Autore:** BIMatch Development Team
