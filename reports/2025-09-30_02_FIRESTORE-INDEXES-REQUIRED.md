# Indici Firestore Richiesti

Questa applicazione richiede i seguenti indici compositi in Firestore per funzionare correttamente. Senza questi indici, alcune query falliranno con l'errore "The query requires an index".

## Come Creare gli Indici

### Metodo 1: Automatico (Consigliato)
Quando esegui l'applicazione e una query fallisce per mancanza di indice, Firebase mostrerà un link nella console del browser. Clicca il link e Firebase creerà automaticamente l'indice necessario.

### Metodo 2: Manuale tramite Firebase Console
1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il tuo progetto `bimatch-cd100`
3. Vai su **Firestore Database** > **Indexes** > **Composite**
4. Clicca **Create Index**
5. Inserisci i campi come specificato sotto

### Metodo 3: Firebase CLI
Puoi creare un file `firestore.indexes.json` nella root del progetto con il contenuto qui sotto, poi eseguire:
```bash
firebase deploy --only firestore:indexes
```

---

## Indici Richiesti

### 1. Notifiche per Utente (per Dashboard)
**Collection:** `notifications`
**Campi:**
- `userId` - Ascending
- `isRead` - Ascending
- `createdAt` - Descending

**Perché:** Permette agli utenti di visualizzare le loro notifiche ordinate per data, con filtro su lette/non lette.

**Query che lo usano:**
- Dashboard professionista: notifiche non lette
- Dashboard azienda: notifiche non lette
- Pagina notifiche: elenco completo ordinato per data

---

### 2. Progetti per Azienda e Stato
**Collection:** `projects`
**Campi:**
- `companyId` - Ascending
- `status` - Ascending
- `postedAt` - Descending

**Perché:** Permette alle aziende di filtrare i propri progetti per stato (attivo, bozza, completato) e visualizzarli ordinati per data.

**Query che lo usano:**
- Dashboard azienda: conteggio progetti attivi
- Pagina progetti azienda: lista progetti filtrati per stato

---

### 3. Candidature per Professionista
**Collection:** `projectApplications`
**Campi:**
- `professionalId` - Ascending
- `status` - Ascending
- `applicationDate` - Descending

**Perché:** Permette ai professionisti di vedere le proprie candidature filtrate per stato (inviata, accettata, rifiutata, ecc.) ordinate per data.

**Query che lo usano:**
- Dashboard professionista: conteggio candidature per stato
- Pagina progetti professionista: storico candidature

---

### 4. Candidature per Azienda
**Collection:** `projectApplications`
**Campi:**
- `companyId` - Ascending
- `status` - Ascending
- `applicationDate` - Descending

**Perché:** Permette alle aziende di vedere le candidature ricevute filtrate per stato ordinate per data.

**Query che lo usano:**
- Dashboard azienda: conteggio nuovi candidati
- Pagina candidati: lista candidature per progetto

---

### 5. Candidature per Progetto
**Collection:** `projectApplications`
**Campi:**
- `projectId` - Ascending
- `status` - Ascending
- `applicationDate` - Descending

**Perché:** Permette di visualizzare tutte le candidature per un progetto specifico, filtrate per stato.

**Query che lo usano:**
- Pagina dettaglio progetto: lista candidati
- Gestione candidature azienda: filtro per stato candidatura

---

### 6. Progetti con Scadenza (per Filtri Avanzati)
**Collection:** `projects`
**Campi:**
- `status` - Ascending
- `applicationDeadline` - Ascending

**Perché:** Permette di trovare progetti attivi ordinati per scadenza candidatura.

**Query che lo usano:**
- Marketplace progetti: filtro "scadenza imminente"
- Dashboard professionista: progetti con scadenza vicina

---

## File firestore.indexes.json

Crea questo file nella root del progetto per deployment automatico:

```json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isRead",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "companyId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "postedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projectApplications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "professionalId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "applicationDate",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projectApplications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "companyId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "applicationDate",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projectApplications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "applicationDate",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "applicationDeadline",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Verifica Indici Esistenti

Per verificare quali indici sono già stati creati:
1. Vai su Firebase Console
2. Firestore Database > Indexes
3. Controlla la lista sotto "Composite"

Gli indici possono impiegare alcuni minuti per essere creati dopo la richiesta.

---

## Troubleshooting

### Errore: "The query requires an index"
1. Copia l'URL fornito nell'errore della console
2. Aprilo in un browser (devi essere loggato in Firebase)
3. Clicca "Create Index"
4. Attendi il completamento (può richiedere 1-5 minuti)

### Errore: "Index already exists"
L'indice è già stato creato, non serve fare nulla.

### Performance Lenta
Se le query sono lente anche con gli indici:
- Considera l'aggiunta di paginazione (limit + startAfter)
- Valuta la denormalizzazione dei dati
- Controlla il numero di documenti nelle collection

---

## Note di Sviluppo

- Gli indici sono **necessari** solo in produzione
- In locale con Firebase Emulator, le query funzionano anche senza indici
- Se aggiungi nuove query con `where` + `orderBy`, potrebbe servire un nuovo indice
- Firestore supporta massimo 200 indici compositi per progetto