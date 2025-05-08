import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Informativa sulla Privacy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-foreground/90">
          <p className="text-muted-foreground text-center mb-8">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2>1. Introduzione</h2>
          <p>
            Benvenuto in BIMatch (&quot;noi&quot;, &quot;nostro&quot;). Ci impegniamo a proteggere la tua privacy. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, divulghiamo e salvaguardiamo le tue informazioni quando visiti il nostro sito web [IlTuoDominio.it] e utilizzi i nostri servizi. Leggi attentamente questa informativa sulla privacy. Se non sei d&apos;accordo con i termini di questa informativa sulla privacy, ti preghiamo di non accedere al sito.
          </p>

          <h2>2. Raccolta delle Tue Informazioni</h2>
          <p>
            Potremmo raccogliere informazioni su di te in vari modi. Le informazioni che potremmo raccogliere sul Sito includono:
          </p>
          <h3>Dati Personali</h3>
          <p>
            Informazioni di identificazione personale, come nome, indirizzo email, numero di telefono, e informazioni demografiche, come età, sesso, città natale e interessi, che ci fornisci volontariamente quando ti registri al Sito o quando scegli di partecipare a varie attività relative al Sito, come chat online e bacheche.
          </p>
          <h3>Dati Derivati</h3>
          <p>
            Informazioni che i nostri server raccolgono automaticamente quando accedi al Sito, come il tuo indirizzo IP, il tipo di browser, il sistema operativo, i tempi di accesso e le pagine che hai visualizzato direttamente prima e dopo aver effettuato l&apos;accesso al Sito.
          </p>
          <h3>Dati Finanziari</h3>
          <p>
            Attualmente non raccogliamo dati finanziari. Se in futuro dovessimo implementare funzionalità a pagamento, aggiorneremo questa sezione.
          </p>
          <h3>Dati da Firebase</h3>
          <p>
            Utilizziamo Firebase per l&apos;autenticazione e il database. Firebase potrebbe raccogliere dati come specificato nelle loro informative sulla privacy. Ti invitiamo a consultare la <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy di Firebase</a>.
          </p>

          <h2>3. Utilizzo delle Tue Informazioni</h2>
          <p>
            Avere informazioni accurate su di te ci permette di fornirti un&apos;esperienza fluida, efficiente e personalizzata. Nello specifico, potremmo utilizzare le informazioni raccolte su di te tramite il Sito per:
          </p>
          <ul>
            <li>Creare e gestire il tuo account.</li>
            <li>Abbinare professionisti BIM con aziende e viceversa.</li>
            <li>Inviarti email amministrative e newsletter.</li>
            <li>Migliorare l&apos;efficienza e il funzionamento del Sito.</li>
            <li>Monitorare e analizzare l&apos;utilizzo e le tendenze per migliorare la tua esperienza con il Sito.</li>
            <li>Notificarti gli aggiornamenti del Sito.</li>
            <li>Offrirti nuovi prodotti, servizi e/o raccomandazioni.</li>
            <li>Svolgere altre attività commerciali secondo necessità.</li>
          </ul>

          <h2>4. Divulgazione delle Tue Informazioni</h2>
          <p>
            Non condivideremo le tue informazioni con terze parti eccetto come descritto in questa Informativa sulla Privacy o con il tuo consenso.
          </p>

          <h2>5. Sicurezza delle Tue Informazioni</h2>
          <p>
            Utilizziamo misure di sicurezza amministrative, tecniche e fisiche per aiutare a proteggere le tue informazioni personali. Sebbene abbiamo adottato misure ragionevoli per proteggere le informazioni personali che ci fornisci, ti preghiamo di essere consapevole che nessuna misura di sicurezza è perfetta o impenetrabile e nessun metodo di trasmissione dei dati può essere garantito contro qualsiasi intercettazione o altro tipo di uso improprio.
          </p>

          <h2>6. Diritti dell&apos;Interessato</h2>
          <p>
            In base al GDPR e alla normativa italiana sulla privacy, hai il diritto di accedere, rettificare, cancellare i tuoi dati personali, limitare o opporti al loro trattamento, e il diritto alla portabilità dei dati. Per esercitare questi diritti, contattaci utilizzando le informazioni di contatto fornite di seguito.
          </p>

          <h2>7. Contatti</h2>
          <p>
            Se hai domande o commenti su questa Informativa sulla Privacy, ti preghiamo di contattarci a:
            <br />
            [La Tua Email di Contatto per la Privacy]
            <br />
            [Il Tuo Indirizzo Aziendale, se applicabile]
          </p>
          <p className="mt-6 italic">
            Questa è un&apos;informativa sulla privacy generica e potrebbe necessitare di personalizzazione per soddisfare pienamente i requisiti legali specifici e le pratiche di BIMatch. Si consiglia di consultare un legale per assicurarsi della conformità.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
