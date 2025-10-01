# Template Email Firebase - BIMatch

Questo documento contiene i template ottimizzati per le email di Firebase Authentication, personalizzati per BIMatch.

---

## 📧 1. Email di Verifica (Email Address Verification)

### Oggetto Email
```
Verifica il tuo account BIMatch
```

### Corpo Email
```
Ciao,

Benvenuto su BIMatch, la piattaforma italiana per professionisti BIM!

Per completare la registrazione e iniziare a utilizzare tutti i servizi, verifica il tuo indirizzo email cliccando sul link qui sotto:

%LINK%

Questo link scadrà tra 24 ore.

Se non hai richiesto questa registrazione, ignora questa email.

---

Hai bisogno di aiuto?
Contatta il nostro supporto: support@bimatch.it

Cordiali saluti,
Il Team di BIMatch

---
BIMatch - Building Information Modeling Marketplace
Connettere professionisti BIM con le aziende del settore edilizio

Questa è un'email automatica, non rispondere a questo messaggio.
```

---

## 🔑 2. Reset Password (Password Reset)

### Oggetto Email
```
Reimposta la tua password BIMatch
```

### Corpo Email
```
Ciao,

Hai richiesto di reimpostare la password del tuo account BIMatch.

Clicca sul link qui sotto per creare una nuova password:

%LINK%

Questo link scadrà tra 1 ora per motivi di sicurezza.

Se non hai richiesto questo reset, ignora questa email. La tua password attuale rimarrà invariata.

---

Misure di Sicurezza:
- Non condividere mai la tua password
- Usa una password forte con lettere, numeri e caratteri speciali
- BIMatch non ti chiederà mai la password via email

Hai bisogno di aiuto?
Contatta il nostro supporto: support@bimatch.it

Cordiali saluti,
Il Team di BIMatch

---
BIMatch - Building Information Modeling Marketplace
Connettere professionisti BIM con le aziende del settore edilizio

Questa è un'email automatica, non rispondere a questo messaggio.
```

---

## 📧 3. Cambio Email (Email Address Change)

### Oggetto Email
```
Conferma il cambio email per il tuo account BIMatch
```

### Corpo Email
```
Ciao,

Hai richiesto di cambiare l'indirizzo email associato al tuo account BIMatch.

Per confermare questa modifica e associare questo nuovo indirizzo email, clicca sul link qui sotto:

%LINK%

Questo link scadrà tra 24 ore.

Se non hai richiesto questa modifica, ignora questa email e contatta immediatamente il nostro supporto per segnalare un possibile accesso non autorizzato.

---

Hai bisogno di aiuto?
Contatta il nostro supporto: support@bimatch.it

Cordiali saluti,
Il Team di BIMatch

---
BIMatch - Building Information Modeling Marketplace
Connettere professionisti BIM con le aziende del settore edilizio

Questa è un'email automatica, non rispondere a questo messaggio.
```

---

## 🎨 4. SMS Verification (Opzionale - se usi autenticazione SMS)

### Template SMS
```
BIMatch: Il tuo codice di verifica è %APP_CODE%. Non condividerlo con nessuno.
```

---

## 📝 Note Importanti

### Anti-Spam Best Practices Applicate:

✅ **Nome mittente chiaro**: "BIMatch" invece di "Firebase"
✅ **Oggetto descrittivo**: specifica l'azione richiesta
✅ **Testo personalizzato**: riferimenti specifici a BIMatch e settore BIM
✅ **Call-to-action chiara**: istruzioni precise su cosa fare
✅ **Informazioni di contatto**: support@bimatch.it visibile
✅ **Footer professionale**: nome azienda e descrizione
✅ **Avvisi di sicurezza**: rassicurazioni su non condivisione password
✅ **Scadenza link**: trasparenza sui tempi di validità
✅ **Istruzioni se non richiesto**: cosa fare in caso di email non voluta

### Variabili Firebase Disponibili:

- `%LINK%` - Link di azione (verifica, reset, ecc.)
- `%APP_NAME%` - Nome app (configurato in Firebase)
- `%EMAIL%` - Email destinatario (disponibile in alcuni template)
- `%APP_CODE%` - Codice di verifica (solo SMS)

### Configurazioni Aggiuntive Consigliate:

1. **Sender Name**: Cambia da "Firebase" a "BIMatch"
   - Settings → Project Settings → General → Public-facing name

2. **Sender Email**: Personalizza se possibile (richiede dominio custom)
   - Default: `noreply@bimatch-[id].firebaseapp.com`
   - Custom: `noreply@bimatch.it` (richiede configurazione avanzata)

3. **Action URL**: Assicurati che punti al tuo dominio
   - Authentication → Settings → Authorized domains

---

## 🚀 Come Applicare i Template

1. Accedi a Firebase Console: https://console.firebase.google.com/
2. Seleziona progetto BIMatch
3. Vai su **Authentication** → **Templates**
4. Clicca sull'icona **matita** (✏️) per ogni template
5. Copia-incolla il testo personalizzato da questo documento
6. Clicca **Save**
7. Ripeti per tutti e 3 i template

---

## 🧪 Test Email Templates

Dopo aver salvato i template, testa:

1. **Email Verifica**:
   - Registra un nuovo account di test
   - Controlla la casella email (anche spam)
   - Verifica che il testo sia personalizzato

2. **Password Reset**:
   - Vai su Login → "Password dimenticata"
   - Inserisci email di test
   - Controlla email ricevuta

3. **Spam Check**:
   - Controlla se le email arrivano in Posta in Arrivo o Spam
   - Usa servizi come https://www.mail-tester.com/ per verificare spam score

---

## 📊 Monitoraggio Deliverability

Firebase non fornisce statistiche di deliverability. Per monitorare:

1. **Test manuale**: Crea account di test con Gmail, Outlook, Yahoo
2. **Mail-tester**: https://www.mail-tester.com/ (spam score /10)
3. **Feedback utenti**: Chiedi agli utenti se ricevono le email

Se dopo queste modifiche le email continuano ad andare in spam (>20% casi),
sarà necessario implementare **Fase 2** con SendGrid/Mailgun.

---

## 🔄 Prossimi Step (Fase 2 - se necessario)

Se il miglioramento è insufficiente:

1. Implementare Cloud Functions per email custom
2. Integrare SendGrid/Mailgun (SPF/DKIM pre-configurati)
3. Template HTML professionali con logo
4. Dominio custom email (noreply@bimatch.it)
5. Analytics deliverability completi

---

*Documento creato: 2025-10-01*
*Autore: Claude Code + User*
