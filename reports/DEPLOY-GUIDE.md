# 🚀 Guida Deploy Beta - BIMatch

**Versione**: Beta 1.0
**Data**: 2025-10-02
**Dominio**: bimatch.visionxt.tech

---

## ✅ Prerequisiti Completati

Tutto il codice è pronto per il deploy! Ho già implementato:

- ✅ Email verification obbligatoria per registrazione
- ✅ Template email personalizzati (`noreply@bimatch.visionxt.tech`)
- ✅ Firestore indexes deployati (11 indexes per query veloci)
- ✅ Rate limiting server-side (protezione brute force)
- ✅ Firebase Analytics configurato (attivo in produzione)
- ✅ Ottimizzazioni performance (gzip, caching, image optimization)
- ✅ Build produzione testato e funzionante

---

## 📋 Passi per Deploy

### 1. **Abilita Web Frameworks in Firebase**

```bash
firebase experiments:enable webframeworks
```

Questo comando abilita il supporto Next.js in Firebase Hosting.

---

### 2. **Build dell'Applicazione**

Il build è già stato fatto, ma se vuoi rifarlo:

```bash
npm run build
```

**Output atteso**:
- ✓ Compiled successfully
- 29 pagine generate
- Build size: ~102 kB First Load JS

---

### 3. **Deploy su Firebase Hosting**

```bash
firebase deploy --only hosting
```

**Cosa succede**:
- Firebase carica la build Next.js
- Configura il server Next.js su Cloud Functions (region: us-central1)
- Applica i cache headers per performance
- Genera URL temporaneo: `https://bimatch-cd100.web.app`

⏱️ **Tempo stimato**: 3-5 minuti

---

### 4. **Aggiungi Dominio Custom (bimatch.visionxt.tech)**

#### 4a) Firebase Console

1. Vai su: https://console.firebase.google.com/project/bimatch-cd100/hosting/sites
2. Clicca **"Add custom domain"**
3. Inserisci: `bimatch.visionxt.tech`
4. Firebase ti mostrerà i record DNS da aggiungere

#### 4b) Record DNS tipici (Firebase Hosting)

Firebase ti darà qualcosa del tipo:

```
Type: A
Host: bimatch
Value: 151.101.1.195, 151.101.65.195

Type: TXT (verifica)
Host: bimatch
Value: firebase=bimatch-cd100
```

#### 4c) Aggiungi DNS su Squarespace

1. Vai su Squarespace → Domains → visionxt.tech → DNS Settings
2. **Rimuovi** eventuali record esistenti per `bimatch` (se presenti)
3. Aggiungi i record A forniti da Firebase:

```
Type: A
Host: bimatch
Value: 151.101.1.195
```

```
Type: A
Host: bimatch
Value: 151.101.65.195
```

4. Aggiungi record TXT per verifica:

```
Type: TXT
Host: bimatch
Value: firebase=bimatch-cd100
```

⚠️ **IMPORTANTE**: Usa **SOLO** `bimatch` come Host, non `bimatch.visionxt.tech`

#### 4d) Verifica Propagazione

- Attendi 15-30 minuti per propagazione DNS
- Controlla su: https://dnschecker.org (inserisci `bimatch.visionxt.tech`)
- Quando propagato → Firebase completa setup automaticamente
- Firebase provisiona certificato SSL (1-24 ore, di solito 1-2 ore)

---

## 🔐 Configurazione Post-Deploy

### 5. **Verifica Dominio in Firebase Auth**

Il dominio `bimatch.visionxt.tech` è già autorizzato per le email, ma devi aggiungerlo anche per Auth:

1. Firebase Console → Authentication → Settings → Authorized domains
2. Clicca **"Add domain"**
3. Inserisci: `bimatch.visionxt.tech`
4. Salva

---

### 6. **Test dell'App in Produzione**

#### Checklist Test:

**Test 1: Email Verification**
- [ ] Registra nuovo account (professional o company)
- [ ] Ricevi email da `noreply@bimatch.visionxt.tech`
- [ ] Email **NON** va in spam
- [ ] Clicca link verifica → Success
- [ ] Login funziona dopo verifica

**Test 2: Blocco Email Non Verificata**
- [ ] Registra nuovo account
- [ ] Prova a fare login **prima** di verificare email
- [ ] **Risultato atteso**: Bloccato e reindirizzato a `/verify-email`

**Test 3: Dashboard**
- [ ] Login con account verificato
- [ ] Dashboard carica dati reali (non zeri hardcoded)
- [ ] Notifiche funzionano
- [ ] Scroll verticale funziona

**Test 4: Performance**
- [ ] Testa su mobile (responsive)
- [ ] Verifica velocità caricamento (< 3s)
- [ ] Controlla cache immagini

**Test 5: Security**
- [ ] Rate limiting login (prova 5 login errati → blocco)
- [ ] Password complexity (registrazione company)
- [ ] Firestore rules attive (controlla console Firebase)

---

## 🎯 URLs Dopo Deploy

| Servizio | URL |
|----------|-----|
| **App Produzione** | https://bimatch.visionxt.tech |
| **Fallback Firebase** | https://bimatch-cd100.web.app |
| **Firebase Console** | https://console.firebase.google.com/project/bimatch-cd100 |
| **Analytics** | https://console.firebase.google.com/project/bimatch-cd100/analytics |
| **Hosting** | https://console.firebase.google.com/project/bimatch-cd100/hosting |

---

## 📊 Monitoraggio

### Firebase Console - Cosa controllare:

**1. Hosting**
- Deployment history
- Traffico giornaliero
- Bandwidth usage

**2. Analytics** (attivo solo in produzione)
- Page views
- User engagement
- Conversioni registrazione

**3. Firestore**
- Database size (monitorare crescita)
- Query latency
- Indexes status (tutti READY ✅)

**4. Authentication**
- Nuovi utenti giornalieri
- Email verification rate
- Login success/fail ratio

---

## 🚨 Troubleshooting

### Problema: Deploy fallisce

**Soluzione**:
```bash
# 1. Pulisci cache
rm -rf .next node_modules/.cache

# 2. Re-build
npm run build

# 3. Re-deploy
firebase deploy --only hosting
```

### Problema: Dominio non si collega

**Soluzione**:
1. Verifica DNS propagazione: https://dnschecker.org
2. Controlla record DNS su Squarespace (solo `bimatch`, non `bimatch.visionxt.tech`)
3. Aspetta fino a 48 ore (di solito 1-2 ore)

### Problema: SSL non attivo

**Soluzione**:
- Firebase provisiona SSL automaticamente dopo verifica DNS
- Attendi fino a 24 ore (di solito 1-2 ore)
- Verifica su: https://www.ssllabs.com/ssltest/

### Problema: Email vanno in spam

**Soluzione**:
1. Verifica SPF/DKIM configurati (già fatto ✅)
2. Testa spam score: https://mail-tester.com
3. Se score < 7/10 → Considera SendGrid (Fase 2)

### Problema: Query Firestore lente

**Soluzione**:
1. Controlla indexes: https://console.firebase.google.com/project/bimatch-cd100/firestore/indexes
2. Tutti devono essere **READY** ✅
3. Se `BUILDING` → aspetta completamento (1-5 min)

---

## 📝 Comandi Utili

```bash
# Deploy completo
firebase deploy

# Deploy solo Hosting
firebase deploy --only hosting

# Deploy solo Firestore (rules + indexes)
firebase deploy --only firestore

# Deploy solo Storage (rules)
firebase deploy --only storage

# Verifica config Firebase
firebase projects:list

# Test build locale
npm run build && npm start

# Logs produzione
firebase functions:log
```

---

## 🎉 Checklist Finale Pre-Launch

Prima di rendere pubblico l'app:

- [ ] Tutti i test passano ✅
- [ ] Dominio custom attivo con SSL ✅
- [ ] Email verification funzionante ✅
- [ ] Dashboard carica dati reali ✅
- [ ] Rate limiting testato ✅
- [ ] Analytics attivo ✅
- [ ] Firestore indexes tutti READY ✅
- [ ] Privacy Policy aggiornata ✅
- [ ] Terms of Service aggiornati ✅
- [ ] Cookie Banner attivo ✅

---

## 📞 Supporto

**Email Firebase**: firebase-admins@google.com (per problemi tecnici)
**Documentazione**: https://firebase.google.com/docs/hosting

---

## 🔄 Aggiornamenti Futuri

Per deployare modifiche future:

```bash
# 1. Modifica codice
# 2. Test locale
npm run dev

# 3. Build
npm run build

# 4. Deploy
firebase deploy --only hosting
```

**Tempo deploy**: ~3-5 minuti
**Downtime**: Zero (deploy automatico rollout)

---

**Buon deploy! 🚀**

Se tutto funziona, il tuo marketplace BIM sarà online su `bimatch.visionxt.tech` in ~30 minuti (15 min DNS + 15 min deploy).
