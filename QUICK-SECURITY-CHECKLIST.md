# ⚡ Quick Security Testing Checklist

## 🚨 **CRITICAL TESTS - 15 MINUTI**

### ✅ Test Rapidi da Fare SUBITO

#### 1. **Rate Limiting** (2 min)
- [ ] Login con password sbagliata **6 volte**
- [ ] 6° tentativo mostra "Troppi tentativi"
- [ ] Tentativo con email diversa funziona

#### 2. **Session Timeout** (6 min) 
- [ ] Login → non toccare nulla per **6 minuti**
- [ ] A 5 min: warning toast
- [ ] A 6 min: logout automatico

#### 3. **XSS Protection** (1 min)
- [ ] Campo nome registrazione: `<script>alert('XSS')</script>`
- [ ] Nessun alert JavaScript appare
- [ ] Input sanitizzato

#### 4. **Security Headers** (30 sec)
- [ ] DevTools → Network → Response Headers
- [ ] Verifica: `X-Frame-Options: DENY`
- [ ] Verifica: `Content-Security-Policy`

#### 5. **Cookie Banner** (30 sec)
- [ ] Browser incognito → banner appare
- [ ] "Solo Necessari" → scompare
- [ ] Refresh → non riappare

#### 6. **File Upload** (1 min)
- [ ] Carica file `.exe` → bloccato
- [ ] Carica file > 5MB → bloccato
- [ ] Solo PDF/immagini accettati

#### 7. **Audit Logging** (2 min)
- [ ] Firebase Console → auditLogs collection
- [ ] Vedi LOGIN_SUCCESS, LOGIN_FAILED
- [ ] Timestamp e details corretti

---

## 🔧 **SCRIPT AUTOMATICO**

### Copia e incolla in Browser Console:
```javascript
// Copia tutto il contenuto di security-test-script.js
// Oppure carica il file e esegui:
```

**Poi esegui**: `BIMatchSecurityTests.runAll()`

---

## ⚠️ **RED FLAGS - STOP DEPLOY SE:**

- ❌ Rate limiting non funziona
- ❌ Session timeout non attivo  
- ❌ Script XSS si esegue
- ❌ Security headers mancanti
- ❌ File malicious caricati
- ❌ Cookie banner non appare
- ❌ Audit logs non creati

---

## ✅ **TUTTO OK SE:**

- ✅ Rate limiting blocca a 6 tentativi
- ✅ Logout automatico a 6 minuti
- ✅ Input XSS sanitizzati
- ✅ Headers di sicurezza presenti
- ✅ Upload limitato a file sicuri
- ✅ Cookie banner conforme GDPR
- ✅ Eventi loggati in Firebase

---

**🎯 Tempo totale: ~15 minuti per test critici**
**🚀 Se tutti ✅ → DEPLOY SICURO!**