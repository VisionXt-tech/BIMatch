import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Scale, Building, Users, AlertTriangle, Mail, Gavel } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Scale className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-3">Termini e Condizioni di Servizio</h1>
        <p className="text-lg text-muted-foreground">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Main Content */}
      <Card className="shadow-2xl border-2">
        <CardContent className="p-8 space-y-8">

          {/* Accettazione */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">1. Accettazione dei Termini</h2>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <p className="text-base leading-relaxed">
                Utilizzando <strong>BIMatch</strong> (&quot;Sito&quot;, &quot;Servizio&quot;, &quot;Piattaforma&quot;), accetti integralmente
                questi Termini e Condizioni di Servizio (&quot;Termini&quot;, &quot;ToS&quot;).
              </p>
              <p className="text-sm mt-3 text-muted-foreground italic">
                ⚠️ Se non accetti questi Termini, non utilizzare BIMatch.
              </p>
            </div>
          </section>

          <Separator />

          {/* Descrizione Servizio */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">2. Descrizione del Servizio</h2>
            </div>
            <p className="text-base leading-relaxed mb-4">
              <strong>BIMatch</strong> è una piattaforma digitale italiana specializzata nel settore
              <strong> BIM (Building Information Modeling)</strong> che facilita l&apos;incontro tra:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Professionisti BIM
                </p>
                <ul className="text-sm space-y-1 text-foreground/80">
                  <li>• BIM Specialist, Coordinator, Manager</li>
                  <li>• Creazione profilo professionale</li>
                  <li>• Ricerca progetti e opportunità</li>
                  <li>• Portfolio e certificazioni</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  Aziende & Studi
                </p>
                <ul className="text-sm space-y-1 text-foreground/80">
                  <li>• Pubblicazione progetti BIM</li>
                  <li>• Ricerca professionisti qualificati</li>
                  <li>• Gestione candidature</li>
                  <li>• Matching automatico</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* Registrazione Account */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">3. Registrazione e Account</h2>
            </div>
            <div className="space-y-3">
              <p className="text-base">Per utilizzare BIMatch devi registrarti fornendo informazioni:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Veritiere</strong>: dati reali e accurati</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Complete</strong>: tutti i campi obbligatori compilati</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Aggiornate</strong>: mantieni il profilo aggiornato</span>
                </li>
              </ul>
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mt-4">
                <p className="text-sm font-semibold mb-2">🔐 Sicurezza Account</p>
                <ul className="text-xs space-y-1">
                  <li>• Sei responsabile della sicurezza della tua password</li>
                  <li>• Non condividere le credenziali con terzi</li>
                  <li>• Notifica immediatamente accessi non autorizzati</li>
                  <li>• BIMatch non ti chiederà mai la password via email</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* Condotta Utente */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-bold text-primary">4. Condotta dell&apos;Utente</h2>
            </div>
            <p className="text-base mb-3">È <strong className="text-destructive">VIETATO</strong> utilizzare BIMatch per:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Pubblicare contenuti illegali, diffamatori, offensivi, discriminatori o abusivi</span>
              </div>
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Impersonare altre persone o aziende (fake profiles)</span>
              </div>
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Fornire informazioni false, inesatte o fuorvianti (profili, progetti, certificazioni)</span>
              </div>
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Violare leggi italiane o internazionali</span>
              </div>
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Spam, phishing, scraping automatizzato o uso di bot</span>
              </div>
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Tentare di compromettere la sicurezza della piattaforma</span>
              </div>
            </div>
            <p className="text-sm mt-4 text-muted-foreground italic">
              Violazioni di questi termini possono comportare la <strong>sospensione o cancellazione immediata</strong> dell&apos;account.
            </p>
          </section>

          <Separator />

          {/* Proprietà Intellettuale */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">5. Proprietà Intellettuale</h2>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-base">
                Il Servizio BIMatch, il suo design, codice, logo, contenuti originali e funzionalità sono di
                <strong> proprietà esclusiva di BIMatch</strong> e protetti da:
              </p>
              <ul className="grid md:grid-cols-3 gap-2 mt-3">
                <li className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">📜 Copyright</li>
                <li className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">™️ Marchi registrati</li>
                <li className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">⚖️ Diritto d&apos;autore</li>
              </ul>
              <p className="mt-4">
                Non è consentito copiare, modificare, distribuire, vendere o creare opere derivate senza autorizzazione scritta.
              </p>
            </div>
          </section>

          <Separator />

          {/* Contenuti Utente */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">6. Contenuti dell&apos;Utente</h2>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-5 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm mb-3">
                <strong>Sei l&apos;unico responsabile</strong> dei contenuti che pubblichi su BIMatch (profilo, CV, portfolio, progetti, candidature).
              </p>
              <p className="text-sm mb-3">
                Pubblicando contenuti, concedi a BIMatch una <strong>licenza mondiale, non esclusiva, royalty-free</strong> per:
              </p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Visualizzare, riprodurre e distribuire i tuoi contenuti sulla piattaforma</li>
                <li>• Utilizzarli per migliorare il servizio e l&apos;esperienza utente</li>
                <li>• Mostrare anteprime nei risultati di ricerca e matching</li>
              </ul>
              <p className="text-xs mt-3 italic text-muted-foreground">
                Mantieni tutti i diritti di proprietà sui tuoi contenuti originali.
              </p>
            </div>
          </section>

          <Separator />

          {/* Limitazione Responsabilità */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-primary">7. Limitazione di Responsabilità</h2>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <p className="text-sm font-semibold mb-3">⚠️ IMPORTANTE - LEGGI ATTENTAMENTE:</p>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>BIMatch è una piattaforma di intermediazione.</strong> Non garantiamo:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>L&apos;accuratezza delle informazioni fornite dagli utenti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>L&apos;esito positivo di matching o collaborazioni</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>La qualità del lavoro svolto dai professionisti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>Il pagamento o comportamento delle aziende</span>
                  </li>
                </ul>
                <p className="mt-4">
                  <strong>Non siamo responsabili</strong> per danni indiretti, perdite di profitto, dati o opportunità derivanti
                  dall&apos;uso della piattaforma. Gli accordi tra professionisti e aziende sono <strong>esclusiva responsabilità delle parti</strong>.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Sospensione Account */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">8. Sospensione e Cancellazione</h2>
            <p className="text-sm mb-3">BIMatch si riserva il diritto di sospendere o cancellare account in caso di:</p>
            <ul className="space-y-2 text-sm">
              <li>🚫 Violazione dei Termini di Servizio</li>
              <li>🚫 Comportamenti fraudolenti o illegali</li>
              <li>🚫 Reclami multipli da altri utenti</li>
              <li>🚫 Inattività prolungata (oltre 24 mesi)</li>
            </ul>
          </section>

          <Separator />

          {/* Modifiche Termini */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">9. Modifiche ai Termini</h2>
            <p className="text-sm">
              BIMatch può modificare questi Termini in qualsiasi momento. Modifiche sostanziali saranno comunicate con
              <strong> almeno 30 giorni di preavviso</strong> via email. Continuando a utilizzare il Servizio dopo le modifiche,
              accetti i nuovi Termini.
            </p>
          </section>

          <Separator />

          {/* Risoluzione Controversie */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">10. Risoluzione delle Controversie</h2>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm mb-2">
                <strong>Legge Applicabile</strong>: Legge italiana
              </p>
              <p className="text-sm mb-2">
                <strong>Foro Competente</strong>: Tribunale di [Città da specificare], Italia
              </p>
              <p className="text-sm">
                <strong>Mediazione</strong>: Le parti si impegnano a tentare una risoluzione amichevole prima di ricorrere al contenzioso.
              </p>
            </div>
          </section>

          <Separator />

          {/* Varie */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">11. Disposizioni Generali</h2>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Divisibilità</strong>: se una clausola è invalida, le altre rimangono valide</li>
              <li>• <strong>Rinuncia</strong>: la mancata applicazione di un diritto non costituisce rinuncia</li>
              <li>• <strong>Intero accordo</strong>: questi Termini costituiscono l&apos;intero accordo tra le parti</li>
            </ul>
          </section>

          <Separator />

          {/* Contatti */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">12. Contatti</h2>
            </div>
            <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
              <p className="text-base mb-3">Per domande sui Termini di Servizio:</p>
              <div className="space-y-2 text-sm">
                <p><strong>Email Legale</strong>: <a href="mailto:legal@bimatch.it" className="text-primary hover:underline">legal@bimatch.it</a></p>
                <p><strong>Email Supporto</strong>: <a href="mailto:support@bimatch.it" className="text-primary hover:underline">support@bimatch.it</a></p>
                <p><strong>Sede</strong>: [Indirizzo da specificare]</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Footer Note */}
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-900 dark:text-yellow-100 italic">
              ⚠️ <strong>Nota Legale</strong>: Questi Termini di Servizio sono conformi alla normativa italiana,
              ma si consiglia di farli revisionare da un legale specializzato per garantire piena conformità
              alle specifiche esigenze di BIMatch.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
