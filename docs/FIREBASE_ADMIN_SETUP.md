# Setup Firebase Admin SDK - Guida Rapida

## Problema Risolto
L'API di generazione contratti ora usa **Firebase Admin SDK** invece del Client SDK per operazioni server-side.

## Perché Servono le Credenziali

Firebase Admin SDK bypassa le Firestore security rules e **richiede autenticazione** anche in sviluppo locale.

## Setup (Scegli UNA Opzione)

### ✅ Opzione 1: JSON File (CONSIGLIATA per sviluppo)

Questa è l'opzione **più semplice** per lo sviluppo locale.

#### Passaggi:

1. **Vai su Firebase Console**:
   - Apri https://console.firebase.google.com
   - Seleziona il progetto `bimatch-cd100`

2. **Genera Service Account Key**:
   - Vai su **Project Settings** (icona ingranaggio in alto a sinistra)
   - Tab **Service Accounts**
   - Clicca **Generate new private key**
   - Conferma e scarica il file JSON

3. **Salva il file nel progetto**:
   ```bash
   # Salva il file scaricato come:
   c:\Users\lucar\Projects\BIM\BIMatch\firebase-service-account.json
   ```

4. **Aggiungi al file .env.local**:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH="./firebase-service-account.json"
   ```

5. **IMPORTANTE**: Il file è già in `.gitignore` - non sarà mai committato

#### Verifica Setup:

```bash
# Il file dovrebbe esistere
ls firebase-service-account.json

# .env.local dovrebbe contenere
cat .env.local | grep FIREBASE_SERVICE_ACCOUNT_KEY_PATH
```

---

### Opzione 2: Variabili d'Ambiente (per produzione/CI)

Se preferisci non salvare file JSON, puoi usare variabili d'ambiente.

#### Passaggi:

1. Apri il file JSON scaricato
2. Estrai questi valori e aggiungili a `.env.local`:

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...[contenuto della chiave]...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@bimatch-cd100.iam.gserviceaccount.com"
```

**Nota**: La chiave privata deve includere `\n` come escape per i newline.

---

## Riavvio Server

Dopo aver configurato le credenziali:

```bash
# Ferma il server dev (Ctrl+C)
# Riavvia
npm run dev
```

## Verifica Funzionamento

Nel log del server dovresti vedere:

```
[Firebase Admin] Initialized with service account key file: ./firebase-service-account.json
```

Oppure (se usi variabili d'ambiente):

```
[Firebase Admin] Initialized with service account credentials from environment
```

## Troubleshooting

### Errore: "Could not load the default credentials"
**Soluzione**: Le credenziali non sono configurate. Segui i passaggi sopra.

### Errore: "Service account key file not found"
**Soluzione**:
- Verifica che il file esista nel path specificato
- Verifica che `.env.local` contenga il path corretto

### Errore: "Missing or insufficient permissions"
**Soluzione**:
- Questo errore dovrebbe sparire con Admin SDK
- Se persiste, verifica che il service account abbia i permessi corretti su Firebase Console

---

## Produzione

Per il deploy in produzione su Firebase Hosting:

1. **Non servono credenziali esplicite** - Firebase Hosting ha già accesso al progetto
2. Il codice usa automaticamente "application default credentials" in produzione
3. Assicurati di **non deployare** il file JSON:
   ```bash
   # Verificato in .gitignore:
   firebase-service-account.json
   ```

---

## Sicurezza

✅ **MAI committare**:
- `firebase-service-account.json`
- `.env.local` con le chiavi
- Service account keys in generale

✅ **Già protetto**:
- File già in `.gitignore`
- Nessun rischio di commit accidentale

❌ **Non condividere**:
- Service account keys con nessuno
- Le chiavi danno accesso completo al database
