# 🔒 BIMatch - Guida alla Sicurezza e Deploy di Produzione

## ⚡ Checklist Pre-Deploy Critica

### ✅ Sicurezza Implementata

#### 🔐 Autenticazione e Sessioni
- ✅ **Session Timeout Automatico**: 5 minuti di inattività + 1 minuto di warning
- ✅ **Rate Limiting**: 5 tentativi di login per 15 minuti
- ✅ **Audit Logging**: Tracciamento completo delle attività sensibili
- ✅ **Password Security**: Firebase Auth con email verification

#### 🛡️ Protezioni Applicative
- ✅ **Input Validation**: Sanitizzazione e validazione robusta
- ✅ **XSS Protection**: Content Security Policy configurata
- ✅ **CSRF Protection**: SameSite cookies e form validation
- ✅ **Click-jacking Protection**: X-Frame-Options configurato

#### 🏗️ Sicurezza Infrastructure
- ✅ **HTTPS Enforcement**: Strict-Transport-Security headers
- ✅ **Security Headers**: CSP, HSTS, X-Content-Type-Options, ecc.
- ✅ **Firebase Security Rules**: Firestore e Storage Rules ottimizzate
- ✅ **File Upload Security**: Validazione tipo e dimensione file

#### 🍪 Privacy e Compliance
- ✅ **Cookie Banner**: Conforme GDPR per mercato italiano
- ✅ **Privacy Policy**: Link e riferimenti implementati
- ✅ **Data Minimization**: Solo dati necessari raccolti

---

## 🚀 Procedura di Deploy Sicuro

### 1. Pre-Deploy Environment Check

```bash
# Verifica variabili d'ambiente
npm run typecheck
npm run lint
npm run build

# Verifica configurazioni Firebase
firebase use --add production
firebase list
```

### 2. Deploy delle Security Rules

```bash
# Deploy Firestore rules PRIMA del codice
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Verifica rules nel Firebase Console
```

### 3. Deploy Applicazione

```bash
# Build di produzione
npm run build

# Deploy hosting
firebase deploy --only hosting

# Verifica deployment
curl -I https://bimatch.it
```

### 4. Post-Deploy Security Verification

#### Security Headers Check
```bash
curl -I https://bimatch.it | grep -E "(X-Frame|Content-Security|Strict-Transport)"
```

Deve restituire:
- `X-Frame-Options: DENY`
- `Content-Security-Policy: default-src 'self'...`
- `Strict-Transport-Security: max-age=31536000`

#### Functionality Tests
- ✅ Login/logout funzionante
- ✅ Session timeout attivo (test 5 min inattività)
- ✅ Rate limiting login attivo (test 5+ tentativi)
- ✅ File upload sicuro (test tipi file non permessi)
- ✅ Cookie banner visibile
- ✅ Audit logs creati in Firestore

---

## ⚠️ Configurazioni di Sicurezza Critiche

### Firebase Security Rules
Le seguenti rules sono CRITICHE e devono essere verificate:

1. **Firestore Rules**: `/firestore.rules`
   - Users: accesso solo al proprio profilo
   - Projects: visibilità controllata
   - Applications: strict access control
   - Notifications: solo proprietario
   - AuditLogs: solo admin read, authenticated write

2. **Storage Rules**: `/storage.rules`
   - File size limits (5MB PDF, 2MB immagini)
   - Tipo file validation (solo PDF/images)
   - Access control per user paths

### Environment Variables (Production)
```env
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bimatch-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bimatch-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bimatch-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-xxx
```

---

## 🚨 Monitoraggio Post-Deploy

### 1. Logs da Monitorare
- **Firebase Auth**: Login failures, suspicious activity
- **Firestore**: Failed permission checks
- **AuditLogs collection**: High/Critical severity events
- **Application errors**: Console errors, failed requests

### 2. Metriche di Sicurezza
- Tentativi di login falliti per IP/email
- Session timeouts per user
- File upload rejections
- CSP violations (browser dev tools)

### 3. Alerts da Configurare
- Multiple failed logins dallo stesso IP
- Audit events con severity CRITICAL
- Firebase quota/rate limit exceeded
- Errori di sicurezza JS (CSP violations)

---

## 🔧 Maintenance Checklist Settimanale

- [ ] Review audit logs per attività sospette
- [ ] Monitor Firebase quotas e performance
- [ ] Check security headers con online tools
- [ ] Verify backup automatici Firestore
- [ ] Update dipendenze sicurezza (npm audit)
- [ ] Test session timeout functionality
- [ ] Verify CSP headers effectiveness

---

## 🆘 Procedura di Incident Response

### In caso di violazione sospetta:

1. **Immediato**:
   ```bash
   # Disable application
   firebase hosting:disable
   
   # Export audit logs
   firebase firestore:export gs://bucket/incident-$(date +%Y%m%d)
   ```

2. **Analisi**:
   - Review audit logs per timeline
   - Check Firebase Auth logs
   - Analyze browser dev tools per CSP violations
   - Check user reports/complaints

3. **Recovery**:
   - Fix vulnerabilità identificata
   - Update security rules se necessario
   - Re-deploy con fix
   - Comunicazione users se necessario

---

## 📞 Contatti Sicurezza

- **Security Officer**: [admin@bimatch.it]
- **Technical Lead**: [tech@bimatch.it]
- **Emergency**: [emergency@bimatch.it]

---

*Ultimo aggiornamento: 2025-01-11*
*Versione documento: 1.0*