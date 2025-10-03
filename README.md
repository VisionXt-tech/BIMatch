# BIMatch: La Piattaforma per il Mercato BIM Italiano

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

**🚀 Live Demo**: [https://bimatch-cd100.web.app](https://bimatch-cd100.web.app)

BIMatch è una piattaforma web innovativa progettata per essere il punto d'incontro d'elezione tra i professionisti del Building Information Modeling (BIM) e le aziende, studi di progettazione e società di ingegneria in Italia. L'obiettivo è colmare il divario tra la crescente domanda di competenze BIM specifiche e l'offerta di talenti qualificati, creando un ecosistema efficiente e specializzato.

---

## 📋 Indice

- [Potenziale di Mercato](#potenziale-di-mercato)
- [Stack Tecnologico](#stack-tecnologico)
- [Funzionalità Principali](#funzionalità-principali)
- [Come Funziona](#come-funziona-la-piattaforma)
- [Sicurezza e Compliance](#sicurezza-e-compliance)
- [Installazione](#installazione)
- [Deployment](#deployment)
- [Struttura Progetto](#struttura-progetto)

---

## 🎯 Potenziale di Mercato

Il settore delle costruzioni in Italia sta vivendo una profonda trasformazione digitale, con l'adozione del BIM che diventa non solo un vantaggio competitivo, ma un requisito normativo (DM 560/2017 e s.m.i.). In questo contesto:

-   **Aziende in Difficoltà:** Molte aziende faticano a trovare professionisti con competenze specifiche (es. BIM Coordinator con esperienza in Navisworks, BIM Specialist MEP per impianti complessi, esperti di 4D e 5D).
-   **Professionisti Dispersi:** I talenti BIM sono spesso frammentati su piattaforme generaliste (come LinkedIn) dove le loro competenze non vengono valorizzate appieno e le offerte di lavoro non sono sufficientemente dettagliate.
-   **Domanda Crescente:** La necessità di digitalizzare il patrimonio edilizio esistente (BIM for Facility Management) e di ottimizzare i nuovi progetti sta creando una domanda esponenziale di ruoli specializzati.

**BIMatch si inserisce in questo scenario come la soluzione verticale,** offrendo un ambiente dedicato dove le aziende possono descrivere in modo granulare i loro progetti e i professionisti possono mostrare in dettaglio le loro competenze, certificazioni e portfolio.

---

## 🛠️ Stack Tecnologico

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **UI Library**: React 18.3
- **Linguaggio**: TypeScript 5.0
- **Styling**: Tailwind CSS + shadcn/ui
- **Form Management**: React Hook Form + Zod

### Backend & Infrastructure
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication  
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting (SSR Cloud Functions)
- **Runtime**: Node.js 20

### Security & Performance
- Rate Limiting (Client + Server)
- Audit Logging
- Input Validation (Zod + DOMPurify)
- Email Verification obbligatoria
- Session Management

---

## ✨ Funzionalità Principali

### Per Professionisti
- ✅ Profilo dettagliato con competenze BIM
- ✅ Certificazioni (upload PDF o autocertificazione)
- ✅ Marketplace progetti con filtri avanzati
- ✅ Candidatura con cover letter
- ✅ Dashboard gestione candidature
- ✅ Notifiche real-time

### Per Aziende
- ✅ Pubblicazione progetti BIM strutturati
- ✅ Gestione candidati centralizzata
- ✅ Workflow selezione completo
- ✅ Proposte colloquio automatiche
- ✅ Notifiche a ogni step

### Sicurezza
- 🔒 Email verification obbligatoria
- 🔒 Rate limiting (5 tentativi/15min)
- 🔒 Password complexity enforcement
- 🔒 Audit logging completo
- 🔒 GDPR compliant (Cookie Banner + Privacy Policy)
- 🔒 File upload validation

---

## 💻 Installazione

```bash
# 1. Clone repository
git clone https://github.com/your-org/bimatch.git
cd bimatch

# 2. Installa dipendenze
npm install

# 3. Configura environment
cp .env.example .env.local
# Modifica .env.local con credenziali Firebase

# 4. Avvia development
npm run dev
# → http://localhost:9002
```

---

## 🚀 Deployment

```bash
# Build produzione
npm run build

# Deploy Firebase
firebase deploy --only hosting,storage

# Oppure usa script Windows
./scripts/deployment/deploy.ps1
```

Guida completa: [DEPLOY-GUIDE.md](DEPLOY-GUIDE.md)

---

## 📁 Struttura Progetto

```
BIMatch/
├── docs/                      # Documentazione
├── public/                    # Asset statici
├── reports/                   # Report sviluppo
├── scripts/
│   ├── deployment/           # Script deploy
│   └── utils/                # Utility scripts
├── src/
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   ├── types/                # TypeScript types
│   └── constants/            # App constants
├── firebase.json             # Firebase config
├── firestore.rules           # Security rules
└── storage.rules             # Storage rules
```

---

## 📚 Documentazione

- [CLAUDE.md](CLAUDE.md) - Istruzioni Claude Code
- [DEPLOY-GUIDE.md](DEPLOY-GUIDE.md) - Guida deployment
- [SECURITY-DEPLOYMENT.md](SECURITY-DEPLOYMENT.md) - Security checklist
- [reports/](reports/) - Report sessioni sviluppo

---

## 📄 License

Proprietary - © 2025 BIMatch

---

**Versione**: 1.0.0-beta  
**Status**: 🟢 In produzione (Beta)  
**Ultimo aggiornamento**: 2025-10-02
