import type { ProfessionalProfile, CompanyProfile } from '@/types/auth';
import type { Project } from '@/types/project';
import type { ContractData } from '@/types/contract';

export function buildContractPrompt(
  professional: ProfessionalProfile,
  company: CompanyProfile,
  project: Project,
  contractData: ContractData
): string {
  const { professional: profData, company: compData, project: projData, payment } = contractData;

  return `
Sei un avvocato italiano specializzato in contratti di collaborazione professionale nel settore AEC (Architettura, Ingegneria, Costruzioni) e BIM.

COMPITO: Genera un contratto di collaborazione autonoma completo, formalmente valido e conforme alla normativa italiana.

═══════════════════════════════════════════════════════════
DATI PROFESSIONISTA
═══════════════════════════════════════════════════════════
Nome Completo: ${profData.name}
Partita IVA: ${profData.piva}
Codice Fiscale: ${profData.fiscalCode}
Regime Fiscale: ${profData.taxRegime} ${profData.taxRegime === 'forfettario' ? '(L. 190/2014)' : ''}
Indirizzo: ${profData.address}
${profData.email ? `Email: ${profData.email}` : ''}
${profData.phone ? `Telefono: ${profData.phone}` : ''}
Competenze BIM: ${professional.bimSkills?.join(', ') || 'Da definire'}
Software: ${professional.softwareProficiency?.join(', ') || 'Da definire'}
Esperienza: ${professional.experienceLevel || 'Non specificato'}

═══════════════════════════════════════════════════════════
DATI AZIENDA COMMITTENTE
═══════════════════════════════════════════════════════════
Ragione Sociale: ${compData.businessName}
Partita IVA: ${compData.piva}
Sede Legale: ${compData.address}
Rappresentante Legale: ${compData.legalRepresentative}
${compData.email ? `Email: ${compData.email}` : ''}
${compData.phone ? `Telefono: ${compData.phone}` : ''}
Settore: ${company.industry || 'Architettura/Ingegneria'}

═══════════════════════════════════════════════════════════
DETTAGLI PROGETTO
═══════════════════════════════════════════════════════════
Titolo: ${projData.title}

Descrizione Completa:
${projData.description}

Deliverables Richiesti:
${projData.deliverables.map((d, i) => `${i + 1}. ${d}`).join('\n')}

Durata: ${projData.duration}
Data Inizio Prevista: ${projData.startDate}
Data Fine Prevista: ${projData.endDate}

Modalità Lavoro: ${projData.workMode} ${
    projData.workMode === 'remoto'
      ? '(100% da remoto)'
      : projData.workMode === 'ibrido'
      ? '(parzialmente in sede)'
      : '(presenza richiesta in sede)'
  }
${projData.location ? `Sede lavoro: ${projData.location}` : ''}

Budget Totale: €${payment.totalAmount.toLocaleString('it-IT')}
Termini Pagamento: ${payment.paymentTerms}
${
  payment.milestones && payment.milestones.length > 0
    ? `
Modalità Pagamento (suddiviso in milestone):
${payment.milestones
  .map(
    (m) =>
      `- ${m.phase}: ${m.percentage}% (€${m.amount.toLocaleString('it-IT')})${m.description ? ' - ' + m.description : ''}`
  )
  .join('\n')}`
    : ''
}

Tipo Progetto: ${project.projectType}
Competenze Richieste: ${project.requiredSkills.join(', ')}
Software Richiesto: ${project.requiredSoftware.join(', ')}

═══════════════════════════════════════════════════════════
CONDIZIONI SPECIALI
═══════════════════════════════════════════════════════════
${contractData.specialConditions?.ndaRequired ? '⚠️ NDA RICHIESTO - Inserire clausola riservatezza rinforzata' : 'NDA: Standard'}
${contractData.specialConditions?.insuranceRequired ? '⚠️ ASSICURAZIONE RC PROFESSIONALE OBBLIGATORIA' : 'Assicurazione: Consigliata'}
${contractData.specialConditions?.travelExpenses ? 'Spese viaggio: A carico committente' : 'Spese viaggio: Non previste'}
${contractData.specialConditions?.equipmentProvided ? 'Attrezzatura: Fornita dal committente' : 'Attrezzatura: A carico collaboratore'}
${
  contractData.specialConditions?.additionalClauses && contractData.specialConditions.additionalClauses.length > 0
    ? `
Clausole Aggiuntive:
${contractData.specialConditions.additionalClauses.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    : ''
}

═══════════════════════════════════════════════════════════
ISTRUZIONI GENERAZIONE CONTRATTO
═══════════════════════════════════════════════════════════

STRUTTURA OBBLIGATORIA DEL CONTRATTO:

1. INTESTAZIONE
   - Titolo: "CONTRATTO DI COLLABORAZIONE AUTONOMA - SETTORE BIM/AEC"
   - Data e luogo di stipula

2. PREMESSE
   - Identificazione delle parti (chi sono, ruoli, qualifiche)
   - Necessità del Committente (contesto del progetto BIM)
   - Competenze specifiche BIM del Collaboratore
   - Finalità della collaborazione

3. ARTICOLI (Numerati progressivamente):

   Art. 1 - OGGETTO DEL CONTRATTO
   Descrivi dettagliatamente:
   - Ambito della prestazione BIM
   - Fasi del progetto (modellazione, coordinamento, facility management, ecc.)
   - Deliverables specifici con formati file (IFC, RVT, NWD, ecc.)
   - Standard BIM da rispettare (UNI 11337, ISO 19650, ecc.)
   - LOD (Level of Development) richiesti per ogni fase

   Art. 2 - DURATA E TERMINE
   - Data inizio: ${projData.startDate}
   - Data fine: ${projData.endDate}
   - Durata complessiva: ${projData.duration}
   - Possibilità proroga previo accordo scritto
   - Modalità recesso: preavviso 15 giorni tramite PEC/raccomandata

   Art. 3 - CORRISPETTIVO E MODALITÀ DI PAGAMENTO
   ${
     profData.taxRegime === 'forfettario'
       ? `
   - Importo totale: €${payment.totalAmount.toLocaleString('it-IT')} (IVA non applicata - regime forfettario L.190/2014)
   - NO ritenuta d'acconto
   - Marca da bollo €2 su fatture >€77,47
   `
       : `
   - Importo totale: €${payment.totalAmount.toLocaleString('it-IT')} + IVA 22%
   - Ritenuta d'acconto 20% su 78% dell'imponibile
   `
   }
   - Termini pagamento: ${payment.paymentTerms}
   - Modalità: bonifico bancario su IBAN che verrà comunicato
   ${
     payment.milestones && payment.milestones.length > 0
       ? `
   - Pagamenti suddivisi in milestone:
   ${payment.milestones.map((m) => `  * ${m.phase}: €${m.amount.toLocaleString('it-IT')} (${m.percentage}%)${m.description ? ' - ' + m.description : ''}`).join('\n   ')}`
       : ''
   }

   Art. 4 - OBBLIGHI DEL COLLABORATORE
   - Esecuzione diligente secondo best practices BIM
   - Rispetto scadenze milestone e consegne intermedie
   - Comunicazione tempestiva di criticità tecniche
   - ${projData.workMode === 'presenza' ? 'Presenza in sede secondo calendario concordato' : projData.workMode === 'ibrido' ? 'Presenza in sede parziale per riunioni coordinamento' : 'Lavoro da remoto con disponibilità videoconferenze'}
   - Utilizzo software BIM e strumenti professionali propri (salvo diverso accordo)
   - Rispetto standard BIM aziendali e BIM Execution Plan (BEP)
   - Partecipazione a clash detection e coordination meetings

   Art. 5 - OBBLIGHI DEL COMMITTENTE
   - Pagamento corrispettivo nei termini pattuiti
   - Fornire accessi CDE (Common Data Environment) e file base progetto
   - Fornire BIM Execution Plan e template aziendali
   - Fornire informazioni tecniche necessarie tempestivamente
   - ${projData.workMode !== 'remoto' ? 'Fornire postazione lavoro e connessione se richiesta presenza' : 'Fornire credenziali VPN e accessi cloud necessari'}
   - Designare un BIM Coordinator/Manager come referente

   Art. 6 - PROPRIETÀ INTELLETTUALE E DIRITTI D'AUTORE
   - Tutti i modelli BIM, elaborati, documentazione prodotta sono di proprietà esclusiva del Committente
   - Licenza d'uso: piena, esclusiva, perpetua, irrevocabile, mondiale
   - Trasferimento IP avviene al pagamento finale e consegna approvata
   - Collaboratore non può riutilizzare modelli/elaborati per altri committenti
   - File nativi (RVT, NWF, ecc.) e formati interoperabili (IFC, BCF) consegnati con documentazione
   - Diritto del Committente di modificare/integrare i modelli successivamente

   Art. 7 - RISERVATEZZA E PROTEZIONE INFORMAZIONI
   ${
     contractData.specialConditions?.ndaRequired
       ? `
   ⚠️ CLAUSOLA RINFORZATA (progetto confidenziale):
   - Obbligo riservatezza assoluta su: dati progetto, informazioni cliente, modelli BIM, documentazione tecnica
   - Divieto assoluto divulgazione durante e per 3 anni dopo fine contratto
   - Divieto copia/sottrazione file al di fuori del CDE autorizzato
   - Divieto screenshot/registrazioni non autorizzate
   - Penale: €${Math.min(payment.totalAmount * 2, 50000).toLocaleString('it-IT')} per violazione accertata
   - Obbligo restituzione/cancellazione dati a fine progetto
   `
       : `
   - Obbligo riservatezza su informazioni aziendali e dati progetto
   - Divieto divulgazione durante contratto + 2 anni successivi
   - Divieto comunicazione a terzi non autorizzati
   - Utilizzo dati esclusivamente per esecuzione progetto
   `
   }

   Art. 8 - TRATTAMENTO DATI PERSONALI (GDPR)
   - Committente = Titolare del trattamento (art. 4.7 GDPR)
   - Collaboratore = Responsabile esterno (art. 28 GDPR) se tratta dati personali
   - Finalità: esclusivamente esecuzione progetto BIM
   - Base giuridica: esecuzione contratto (art. 6.1.b GDPR)
   - Categorie dati: dati comuni relativi a progetto edilizio
   - Misure sicurezza: ${contractData.specialConditions?.ndaRequired ? 'Livello ALTO - cifratura file, accessi VPN, log audit, backup sicuri' : 'Livello adeguato secondo normativa - password robuste, accessi limitati'}
   - Divieto assoluto comunicazione dati a terzi
   - Obbligo cancellazione dati da dispositivi personali a fine progetto

   Art. 9 - NATURA DEL RAPPORTO E AUTONOMIA
   - Rapporto di collaborazione coordinata e continuativa ex art. 2222 c.c.
   - NO vincolo di subordinazione gerarchica
   - Collaboratore organizza autonomamente modalità e tempi di lavoro
   - Collaboratore può rifiutare incarichi non previsti in questo contratto
   - NO diritto a ferie, malattia, TFR, contributi INPS aziendali
   - Responsabilità fiscale/previdenziale/assicurativa esclusiva del Collaboratore

   Art. 10 - RESPONSABILITÀ, GARANZIE E ASSICURAZIONI
   - Collaboratore garantisce: correttezza modelli BIM, rispetto standard, non violazione diritti terzi
   - Collaboratore risponde per errori/omissioni nei propri elaborati
   - Collaboratore indennizza Committente da eventuali rivendicazioni terzi derivanti da proprie negligenze
   - Limite responsabilità contrattuale: importo totale del contratto
   ${contractData.specialConditions?.insuranceRequired ? `- ⚠️ OBBLIGATORIA Assicurazione RC Professionale massimale minimo €500.000 - Copia polizza da fornire prima inizio lavori` : '- Assicurazione RC Professionale: fortemente consigliata'}

   Art. 11 - RISOLUZIONE E RECESSO
   - Recesso ordinario: 15 giorni calendario preavviso scritto (PEC/raccomandata)
   - Risoluzione immediata per giusta causa in caso di:
     * Grave inadempimento obblighi contrattuali
     * Violazione clausola riservatezza
     * Mancato pagamento oltre 60 giorni
     * Impossibilità sopravvenuta esecuzione progetto
   - In caso risoluzione anticipata: pagamento pro-quota lavoro effettivamente svolto e approvato
   - Consegna immediata materiali prodotti fino a data risoluzione

   Art. 12 - VARIAZIONI E MODIFICHE CONTRATTUALI
   - Modifiche contrattuali valide solo se fatte per iscritto
   - Email e PEC considerate forme scritte valide
   - Variazioni progettuali significative possono comportare rinegoziazione corrispettivo

   Art. 13 - SPESE CONTRATTUALI E ACCESSORIE
   - Bolli, spese registrazione (se necessaria): metà per parte
   ${contractData.specialConditions?.travelExpenses ? '- Spese viaggio/trasferta autorizzate: a carico Committente previa approvazione scritta preventiva' : '- Spese viaggio: non previste o a carico Collaboratore'}
   ${contractData.specialConditions?.equipmentProvided ? '- Attrezzatura e software: forniti dal Committente' : '- Software e licenze BIM: a carico Collaboratore'}

   Art. 14 - LEGGE APPLICABILE E FORO COMPETENTE
   - Legge italiana
   - Per ogni controversia: Foro competente di ${extractCity(compData.address)}
   - Prima di adire vie legali: tentativo bonario di risoluzione tramite mediazione

   Art. 15 - CLAUSOLE FINALI
   - Presente contratto costituisce accordo integrale tra le parti
   - Sostituisce ogni precedente intesa verbale o scritta
   - Eventuali clausole nulle non inficiano validità del resto del contratto
   - Modificabile esclusivamente per iscritto con consenso entrambe parti

═══════════════════════════════════════════════════════════
FIRME
═══════════════════════════════════════════════════════════

Redatto e sottoscritto in duplice copia originale.

Luogo: ________________  Data: ___/___/______


IL COMMITTENTE                           IL COLLABORATORE
${compData.businessName}                 ${profData.name}
Rappresentante Legale:                   C.F.: ${profData.fiscalCode}
${compData.legalRepresentative}          P.IVA: ${profData.piva}


_____________________________            _____________________________
(Firma per accettazione)                 (Firma per accettazione)


═══════════════════════════════════════════════════════════
REGOLE DI STILE E FORMATO
═══════════════════════════════════════════════════════════

1. Usa linguaggio FORMALE ma COMPRENSIBILE (no legalese arcaico inutile)
2. Frasi chiare, dirette, senza ambiguità
3. Numera tutti gli articoli progressivamente (Art. 1, Art. 2, ecc.)
4. Usa elenchi <ul><li> per maggiore chiarezza invece di elenchi puntati testuali
5. Usa <strong> per evidenziare: importi, date, termini temporali, clausole importanti
6. Specifica sempre unità di misura (€, giorni, mesi)
7. NO abbreviazioni ambigue
8. Date in formato GG/MM/AAAA (formato italiano)
9. Importi in formato <strong>€X.XXX,XX</strong> (separatore migliaia punto, decimali virgola)
10. Usa terminologia BIM corretta (LOD, IFC, CDE, BEP, ecc.)
11. Ogni paragrafo importante deve essere in un tag <p> separato
12. Suddividi il contenuto in paragrafi ben distinti per facilitare la lettura

═══════════════════════════════════════════════════════════
VALIDAZIONE OBBLIGATORIA
═══════════════════════════════════════════════════════════

Prima di completare, VERIFICA che il contratto contenga:
✓ Tutte le generalità complete (nome, CF, P.IVA, indirizzi)
✓ Oggetto specifico del lavoro BIM
✓ Durata con date precise inizio/fine
✓ Corrispettivo esatto e scadenze pagamento
✓ Regime fiscale corretto applicato
✓ Clausola GDPR conforme
✓ Proprietà intellettuale chiara su modelli BIM
✓ Clausola recesso con termini
✓ Foro competente specificato
✓ Obblighi specifici di entrambe le parti
✓ Natura autonoma del rapporto (no subordinazione)

═══════════════════════════════════════════════════════════
OUTPUT RICHIESTO - FORMATO HTML
═══════════════════════════════════════════════════════════

Genera il contratto in formato HTML ben strutturato seguendo questa struttura:

<div class="contract-document">
  <div class="contract-header">
    <h1 class="contract-title">CONTRATTO DI COLLABORAZIONE AUTONOMA - SETTORE BIM/AEC</h1>
    <p class="contract-date">Stipulato in data [DATA]</p>
  </div>

  <section class="contract-section">
    <h2 class="section-title">PREMESSE</h2>
    <div class="section-content">
      <p>[Contenuto premesse]</p>
    </div>
  </section>

  <section class="contract-section">
    <h2 class="section-title">Art. 1 - OGGETTO DEL CONTRATTO</h2>
    <div class="section-content">
      <p>[Contenuto articolo]</p>
      <ul>
        <li>[Punto elenco se necessario]</li>
      </ul>
    </div>
  </section>

  [... altri articoli ...]

  <section class="contract-signatures">
    <h2 class="section-title">FIRME</h2>
    <div class="signatures-grid">
      <div class="signature-block">
        <p class="signature-label">IL COMMITTENTE</p>
        <p class="signature-name">${compData.businessName}</p>
        <p class="signature-detail">Rappresentante Legale: ${compData.legalRepresentative}</p>
        <div class="signature-line"></div>
        <p class="signature-caption">(Firma per accettazione)</p>
      </div>
      <div class="signature-block">
        <p class="signature-label">IL COLLABORATORE</p>
        <p class="signature-name">${profData.name}</p>
        <p class="signature-detail">C.F.: ${profData.fiscalCode}</p>
        <p class="signature-detail">P.IVA: ${profData.piva}</p>
        <div class="signature-line"></div>
        <p class="signature-caption">(Firma per accettazione)</p>
      </div>
    </div>
  </section>
</div>

REGOLE HTML:
- Usa SOLO i tag: div, section, h1, h2, h3, p, ul, li, strong, em
- Ogni articolo è una <section class="contract-section">
- I titoli degli articoli usano <h2 class="section-title">
- Il contenuto usa <div class="section-content">
- Usa <strong> per evidenziare importi, date, termini importanti
- Usa <ul><li> per elenchi puntati
- NO inline styles, NO script, NO altri tag HTML
- Mantieni la struttura semantica pulita

Il contratto deve essere completo, formalmente valido e immediatamente pronto per la visualizzazione.
`;
}

// Helper per estrarre città da indirizzo
function extractCity(address: string): string {
  // Prova a estrarre la città dall'indirizzo (semplice euristica)
  const parts = address.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : 'Milano';
}
