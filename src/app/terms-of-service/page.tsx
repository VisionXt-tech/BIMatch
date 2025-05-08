import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Termini e Condizioni del Servizio</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-foreground/90">
          <p className="text-muted-foreground text-center mb-8">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2>1. Accettazione dei Termini</h2>
          <p>
            Utilizzando il sito web BIMatch (&quot;Sito&quot;) e i servizi (&quot;Servizio&quot;) forniti da BIMatch (&quot;noi&quot;, &quot;nostro&quot;), accetti di essere vincolato dai seguenti termini e condizioni (&quot;Termini di Servizio&quot;). Se non accetti questi Termini di Servizio, non utilizzare il Sito o il Servizio.
          </p>

          <h2>2. Descrizione del Servizio</h2>
          <p>
            BIMatch è una piattaforma online che connette professionisti del Building Information Modeling (BIM) con aziende del settore edilizio in Italia. Forniamo strumenti per la creazione di profili, la pubblicazione di progetti, la ricerca e il matching tra professionisti e aziende.
          </p>

          <h2>3. Registrazione Account</h2>
          <p>
            Per accedere a determinate funzionalità del Servizio, devi registrarti per un account. Quando ti registri, accetti di fornire informazioni veritiere, accurate, aggiornate e complete su di te come richiesto dal modulo di registrazione del Servizio. Sei responsabile della salvaguardia della password che utilizzi per accedere al Servizio e di qualsiasi attività o azione eseguita con la tua password.
          </p>

          <h2>4. Condotta dell&apos;Utente</h2>
          <p>
            Accetti di non utilizzare il Servizio per:
          </p>
          <ul>
            <li>Pubblicare contenuti illegali, dannosi, minacciosi, abusivi, molesti, diffamatori, volgari, osceni, calunniosi, invasivi della privacy altrui, odiosi o razzialmente, etnicamente o altrimenti discutibili.</li>
            <li>Impersonare qualsiasi persona o entità, o dichiarare falsamente o altrimenti travisare la tua affiliazione con una persona o entità.</li>
            <li>Pubblicare informazioni false, inaccurate o fuorvianti nei profili, nei progetti o nelle candidature.</li>
            <li>Violare qualsiasi legge locale, statale, nazionale o internazionale applicabile.</li>
          </ul>

          <h2>5. Proprietà Intellettuale</h2>
          <p>
            Il Servizio e i suoi contenuti originali (esclusi i Contenuti forniti dagli utenti), le caratteristiche e le funzionalità sono e rimarranno di proprietà esclusiva di BIMatch e dei suoi licenziatari. Il Servizio è protetto da copyright, marchi registrati e altre leggi sia italiane che estere.
          </p>

          <h2>6. Contenuti dell&apos;Utente</h2>
          <p>
            Sei l&apos;unico responsabile di tutti i contenuti (testi, immagini, informazioni del profilo, dettagli del progetto, ecc.) che carichi, pubblichi, invii via email, trasmetti o rendi altrimenti disponibile tramite il Servizio (&quot;Contenuti dell&apos;Utente&quot;). Concedi a BIMatch una licenza mondiale, non esclusiva, royalty-free per utilizzare, copiare, riprodurre, elaborare, adattare, modificare, pubblicare, trasmettere, visualizzare e distribuire tali Contenuti dell&apos;Utente in qualsiasi e tutti i media o metodi di distribuzione ora noti o sviluppati successivamente ai fini del funzionamento e del miglioramento del Servizio.
          </p>
          
          <h2>7. Limitazione di Responsabilità</h2>
          <p>
            Nei limiti massimi consentiti dalla legge applicabile, in nessun caso BIMatch, i suoi affiliati, direttori, dipendenti, agenti, fornitori o licenziatari saranno responsabili per eventuali danni indiretti, punitivi, incidentali, speciali, consequenziali o esemplari, inclusi, senza limitazione, danni per perdita di profitti, avviamento, uso, dati o altre perdite intangibili, derivanti da o relativi all&apos;uso o all&apos;impossibilità di utilizzare il servizio.
          </p>
          <p>
            BIMatch non è responsabile per le interazioni tra utenti (professionisti e aziende). Non verifichiamo l&apos;accuratezza delle informazioni fornite dagli utenti e non garantiamo l&apos;esito di alcun matching o collaborazione.
          </p>

          <h2>8. Modifiche ai Termini</h2>
          <p>
            Ci riserviamo il diritto, a nostra esclusiva discrezione, di modificare o sostituire questi Termini in qualsiasi momento. Se una revisione è materiale, cercheremo di fornire un preavviso di almeno 30 giorni prima che i nuovi termini entrino in vigore. Ciò che costituisce una modifica materiale sarà determinato a nostra esclusiva discrezione.
          </p>

          <h2>9. Legge Applicabile</h2>
          <p>
            Questi Termini saranno disciplinati e interpretati in conformità con le leggi italiane, senza riguardo alle disposizioni sui conflitti di legge.
          </p>

          <h2>10. Contatti</h2>
          <p>
            Se hai domande su questi Termini, ti preghiamo di contattarci a:
            <br />
            [La Tua Email di Contatto]
          </p>
          <p className="mt-6 italic">
            Questi sono termini di servizio generici e potrebbero necessitare di personalizzazione per soddisfare pienamente i requisiti legali specifici e le pratiche di BIMatch. Si consiglia di consultare un legale per assicurarsi della conformità.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
