# Test delle Correzioni Critiche - BIMatch

Questo documento contiene le istruzioni dettagliate per testare le 3 correzioni critiche applicate all'applicazione.

## Pre-requisiti

1. **Server di sviluppo attivo**: `npm run dev` (porta 9002)
2. **Account di test creati**:
   - Un account azienda
   - Un account professionista
3. **Firestore rules aggiornate**: Le nuove regole devono essere deployate su Firebase

---

## ⚠️ IMPORTANTE: Deploy delle Firestore Rules

Prima di iniziare i test, **devi deployare le nuove regole Firestore**:

```bash
firebase deploy --only firestore:rules
```

Verifica che il deploy sia completato con successo prima di procedere. Senza questo step, i test falliranno comunque perché le vecchie regole sono ancora attive.

---

## 🔧 Correzione 1: Sistema Notifiche

### Cosa è stato corretto
Le regole Firestore bloccavano completamente la creazione di notifiche. Ora gli utenti autenticati possono creare notifiche con validazione dei campi.

### Test da eseguire

#### Test 1.1: Creazione Notifica tramite Candidatura Progetto

**Scenario:** Un professionista si candida a un progetto e l'azienda riceve una notifica.

**Passi:**
1. **Login come Professionista**
   - Vai a http://localhost:9002/login
   - Effettua il login con un account professionista

2. **Candidatura a Progetto**
   - Vai alla pagina progetti (o cerca un progetto pubblico)
   - Clicca su un progetto attivo di un'azienda
   - Clicca su "Candidati per questo Progetto"
   - Compila il form di candidatura:
     - Cover letter: scrivi un messaggio
     - Skills rilevanti: seleziona almeno una skill
     - Note disponibilità: (opzionale)
   - Clicca "Invia Candidatura"

3. **Verifica Successo**
   - ✅ Dovresti vedere un messaggio di successo tipo "Candidatura inviata con successo!"
   - ✅ **Apri la console del browser** (F12) e controlla che NON ci siano errori tipo "Permission denied" o "Missing or insufficient permissions"
   - ✅ Se vedi console logs positivi tipo "Notification created successfully", perfetto!

4. **Verifica Notifica Ricevuta (Login Azienda)**
   - Logout dal professionista
   - Login come azienda (quella che ha pubblicato il progetto)
   - Vai alla Dashboard azienda
   - ✅ Il contatore "Notifiche" dovrebbe mostrare almeno 1 notifica non letta
   - Clicca su "Notifiche"
   - ✅ Dovresti vedere la notifica "Nuova candidatura ricevuta per [Nome Progetto]"

**Risultato atteso:** ✅ Notifica creata e visibile senza errori

---

#### Test 1.2: Notifica Proposta Colloquio

**Scenario:** L'azienda propone un colloquio e il professionista riceve una notifica.

**Passi:**
1. **Login come Azienda**
   - Vai a http://localhost:9002/login
   - Login con account azienda

2. **Gestisci Candidatura**
   - Vai su "Progetti" > Seleziona un progetto con candidature
   - Clicca "Visualizza Candidati"
   - Seleziona una candidatura con stato "Inviata"
   - Clicca su "Proponi Colloquio"
   - Compila:
     - Data colloquio: scegli una data futura
     - Messaggio: scrivi un messaggio
   - Clicca "Invia Proposta"

3. **Verifica**
   - ✅ Messaggio di successo visualizzato
   - ✅ **Console del browser**: nessun errore di permessi
   - ✅ Stato candidatura cambiato in "Colloquio Proposto"

4. **Verifica Notifica (Login Professionista)**
   - Logout dall'azienda
   - Login come professionista
   - Dashboard > Notifiche
   - ✅ Notifica "Colloquio proposto per [Nome Progetto]" presente

**Risultato atteso:** ✅ Notifica di colloquio creata correttamente

---

#### Test 1.3: Check Console per Errori Firestore

**Durante TUTTI i test precedenti**, monitora la console del browser (F12 > Console):

❌ **Errori da NON vedere:**
- `FirebaseError: Missing or insufficient permissions`
- `FirebaseError: PERMISSION_DENIED`
- `Failed to create notification`

✅ **Log positivi da vedere:**
- `Notification created successfully`
- `Application submitted successfully`
- Log di conferma senza errori rossi

---

## 🏢 Correzione 2: Dashboard Aziende

### Cosa è stato corretto
La dashboard aziendale mostrava sempre 0 progetti, 0 candidati, 0 notifiche. Ora carica i dati reali da Firestore.

### Test da eseguire

#### Test 2.1: Contatori Dashboard Azienda

**Pre-requisiti:**
- Un account azienda che ha pubblicato almeno 1 progetto
- Almeno 1 candidatura ricevuta su quel progetto
- Almeno 1 notifica non letta

**Passi:**
1. **Login come Azienda**
   - Vai a http://localhost:9002/login
   - Login con account azienda

2. **Visualizza Dashboard**
   - Dovresti essere automaticamente nella dashboard (/dashboard/company)
   - Osserva i contatori nei box colorati

3. **Verifica Progetti Attivi**
   - ✅ Il box "Progetti" deve mostrare il numero corretto di progetti con stato "attivo"
   - ✅ NON deve mostrare "0 attivi" se hai progetti attivi
   - **Apri Console del browser**: cerca log tipo `Progetti attivi: X` (dove X > 0)

4. **Verifica Candidati**
   - ✅ Il box "Candidati" deve mostrare "X nuovi" (candidature con stato 'inviata')
   - ✅ Se hai candidature nuove, il numero deve essere > 0
   - **Console**: cerca `Nuovi candidati: X`

5. **Verifica Collaborazioni**
   - ✅ Il box "Collaborazioni" mostra "X attive" (candidature accettate)
   - **Console**: `Collaborazioni attive: X`

6. **Verifica Notifiche**
   - ✅ Il box "Notifiche" mostra "X non lette"
   - **Console**: `Notifiche non lette: X`

**Risultato atteso:** ✅ Tutti i contatori mostrano numeri reali, NON zero hardcodato

---

#### Test 2.2: Verifica Caricamento Dati

**Passi:**
1. **Ricarica la Dashboard** (F5)
2. **Osserva lo stato di loading**
   - ✅ Dovrebbe apparire brevemente uno spinner di caricamento sui box
   - ✅ Dopo 1-3 secondi i numeri reali appaiono

3. **Console del Browser**
   - ✅ Dovresti vedere log come:
     ```
     Dashboard caricata per azienda: [uid]
     Progetti attivi: X
     Nuovi candidati: Y
     Collaborazioni attive: Z
     Notifiche non lette: W
     ```
   - ❌ NON dovresti vedere: `Errore nel caricamento dashboard azienda`

**Risultato atteso:** ✅ Caricamento completato senza errori, dati reali visualizzati

---

#### Test 2.3: Test con Dati Vuoti

**Scenario:** Azienda nuova senza progetti o candidature.

**Passi:**
1. **Crea un nuovo account azienda** (o usa uno senza progetti)
2. **Login e vai alla Dashboard**
3. **Verifica:**
   - ✅ Tutti i contatori mostrano "0" (corretto, perché non ci sono dati)
   - ✅ NON ci sono messaggi di errore
   - ✅ La dashboard si carica normalmente
   - ✅ I box sono comunque funzionanti e cliccabili

**Risultato atteso:** ✅ Dashboard funziona anche con dati vuoti

---

## 📑 Correzione 3: Indici Firestore

### Cosa è stato corretto
Documentati gli indici compositi necessari per le query complesse. Gli indici devono essere creati manualmente.

### Test da eseguire

#### Test 3.1: Creazione Indici Automatica

**Metodo consigliato:** Lascia che Firebase ti guidi.

**Passi:**
1. **Esegui i Test 1 e 2** (sopra)
2. **Se vedi errori in console** tipo:
   ```
   FirebaseError: The query requires an index.
   You can create it here: https://console.firebase.google.com/...
   ```

3. **Copia l'URL dall'errore**
4. **Aprilo in un browser** (mentre sei loggato in Firebase)
5. **Clicca "Create Index"**
6. **Attendi 1-5 minuti** per la creazione
7. **Ricarica la pagina** dell'applicazione e riprova

**Risultato atteso:** ✅ Dopo la creazione dell'indice, l'errore scompare

---

#### Test 3.2: Creazione Indici Manuale (Opzionale)

**Se preferisci creare tutti gli indici subito:**

**Passi:**
1. **Vai su Firebase Console**
   - https://console.firebase.google.com
   - Seleziona progetto `bimatch-cd100`
   - Firestore Database > Indexes

2. **Crea gli indici seguendo la guida**
   - Apri `FIRESTORE-INDEXES-REQUIRED.md`
   - Segui le istruzioni per ogni indice

3. **Oppure usa Firebase CLI:**
   ```bash
   # Crea il file firestore.indexes.json nella root (vedi FIRESTORE-INDEXES-REQUIRED.md)
   firebase deploy --only firestore:indexes
   ```

4. **Attendi il completamento**
5. **Verifica su Firebase Console** che gli indici siano "Enabled"

**Risultato atteso:** ✅ Tutti gli indici creati e funzionanti

---

## ✅ Checklist Completa di Test

Usa questa checklist durante i test:

### Correzione 1: Notifiche
- [ ] Professionista si candida → Notifica creata per azienda
- [ ] Azienda propone colloquio → Notifica creata per professionista
- [ ] Nessun errore "Permission denied" in console
- [ ] Contatore notifiche aggiornato correttamente

### Correzione 2: Dashboard Aziende
- [ ] Contatore "Progetti attivi" mostra numero reale (non 0 hardcodato)
- [ ] Contatore "Candidati" mostra candidature nuove reali
- [ ] Contatore "Collaborazioni" mostra accettazioni reali
- [ ] Contatore "Notifiche" mostra notifiche non lette reali
- [ ] Console mostra log corretti di caricamento dati
- [ ] Nessun errore di caricamento visualizzato

### Correzione 3: Indici Firestore
- [ ] Nessun errore "requires an index" durante i test
- [ ] Tutti gli indici necessari creati (6 indici compositi)
- [ ] Query di dashboard funzionano velocemente

---

## 🐛 Cosa Fare se i Test Falliscono

### Se le Notifiche NON Funzionano

**Problema:** Vedi ancora "Permission denied" per notifiche.

**Causa probabile:** Le nuove Firestore rules non sono state deployate.

**Soluzione:**
```bash
firebase deploy --only firestore:rules
```
Attendi il completamento e riprova.

---

### Se la Dashboard Mostra Ancora Zeri

**Problema:** I contatori mostrano tutti 0 anche se hai dati.

**Causa 1:** Indici Firestore mancanti.

**Soluzione:** Controlla la console browser per errori "requires an index" e crea gli indici necessari.

**Causa 2:** Problemi di autenticazione.

**Soluzione:** Verifica che `user.uid` corrisponda al `companyId` dei progetti. Controlla console logs.

---

### Se gli Indici Non si Creano

**Problema:** Errori durante la creazione indici.

**Soluzione:**
1. Verifica di avere i permessi di Editor/Owner sul progetto Firebase
2. Controlla la quota indici (max 200 per progetto)
3. Usa Firebase CLI invece della console

---

## 📊 Report Test

Dopo aver completato tutti i test, annota i risultati:

### Test Completati con Successo ✅
- [ ] Test 1.1: Notifica candidatura
- [ ] Test 1.2: Notifica colloquio
- [ ] Test 1.3: Console senza errori
- [ ] Test 2.1: Contatori dashboard
- [ ] Test 2.2: Caricamento dati
- [ ] Test 2.3: Dashboard con dati vuoti
- [ ] Test 3.1: Indici creati
- [ ] Test 3.2: Nessun errore di indici mancanti

### Problemi Riscontrati ❌
_(Annota qui eventuali problemi trovati durante i test)_

---

## 🎯 Prossimi Passi

Una volta completati questi test con successo:

1. **Comunica i risultati**
   - Quali test sono passati ✅
   - Quali test hanno fallito ❌
   - Eventuali errori in console

2. **Procedi alle correzioni successive**
   - Problemi ad alta priorità
   - Implementazione mancante (es. upload file su Storage)
   - Miglioramenti di sicurezza

3. **Aggiorna la documentazione**
   - Eventuali note o workaround trovati
   - Aggiorna CLAUDE.md se necessario