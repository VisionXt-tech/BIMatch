import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, UserCheck, Mail, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-3">Informativa sulla Privacy</h1>
        <p className="text-lg text-muted-foreground">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Main Content */}
      <Card className="shadow-2xl border-2">
        <CardContent className="p-8 space-y-8">

          {/* Introduzione */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">1. Introduzione</h2>
            </div>
            <p className="text-base leading-relaxed text-foreground/90">
              Benvenuto su <strong>BIMatch</strong>, la piattaforma italiana dedicata al settore BIM (Building Information Modeling).
              Ci impegniamo a proteggere la tua privacy e a garantire la sicurezza dei tuoi dati personali in conformità con il
              <strong> GDPR (Regolamento UE 2016/679)</strong> e il <strong>D.Lgs. 196/2003</strong> (Codice Privacy italiano).
            </p>
            <p className="text-base leading-relaxed text-foreground/90 mt-3">
              Questa informativa spiega quali dati raccogliamo, come li utilizziamo e quali sono i tuoi diritti.
              Utilizzando BIMatch, accetti i termini di questa Privacy Policy.
            </p>
          </section>

          <Separator />

          {/* Titolare del Trattamento */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">2. Titolare del Trattamento</h2>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-base font-semibold mb-2">BIMatch</p>
              <p className="text-sm text-muted-foreground">Email: privacy@bimatch.it</p>
              <p className="text-sm text-muted-foreground">Sede: [Indirizzo da specificare]</p>
            </div>
          </section>

          <Separator />

          {/* Raccolta Dati */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">3. Dati Raccolti</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">📋</span> Dati Forniti Direttamente
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                  <li><strong>Professionisti</strong>: nome, cognome, email, competenze BIM, certificazioni, portfolio, CV, tariffa giornaliera</li>
                  <li><strong>Aziende</strong>: ragione sociale, Partita IVA, settore, dimensione aziendale, contatti, logo</li>
                  <li>Informazioni di profilo e preferenze di matching</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">🔍</span> Dati Raccolti Automaticamente
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                  <li>Indirizzo IP, tipo di browser, dispositivo, sistema operativo</li>
                  <li>Timestamp di accesso e navigazione sul sito</li>
                  <li>Cookie tecnici e di preferenza (vedi Cookie Policy)</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">🔐</span> Servizi di Terze Parti
                </h3>
                <p className="text-sm text-foreground/80 mb-2">
                  Utilizziamo <strong>Firebase by Google</strong> per autenticazione, database e hosting.
                  Firebase raccoglie dati tecnici secondo la loro
                  <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer"
                     className="text-primary hover:underline font-medium"> Privacy Policy</a>.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Utilizzo Dati */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">4. Finalità del Trattamento</h2>
            </div>
            <p className="text-base mb-3">Utilizziamo i tuoi dati per le seguenti finalità:</p>
            <ul className="grid md:grid-cols-2 gap-3">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Creazione e gestione account utente</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Matching tra professionisti e aziende</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Gestione progetti e candidature</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Invio notifiche e comunicazioni di servizio</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Miglioramento della piattaforma</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Sicurezza e prevenzione frodi</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Adempimenti legali e fiscali</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>Statistiche anonimizzate</span>
              </li>
            </ul>
          </section>

          <Separator />

          {/* Base Giuridica */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">5. Base Giuridica del Trattamento</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Consenso</strong>: per attività di marketing e newsletter (opt-in)</p>
              <p><strong>Esecuzione contratto</strong>: per fornirti i servizi richiesti (matching, progetti)</p>
              <p><strong>Obbligo legale</strong>: per adempimenti fiscali e normativi</p>
              <p><strong>Legittimo interesse</strong>: per sicurezza, prevenzione frodi, miglioramento servizi</p>
            </div>
          </section>

          <Separator />

          {/* Condivisione Dati */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">6. Condivisione dei Dati</h2>
            <p className="text-base mb-3">I tuoi dati possono essere condivisi con:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Altri utenti</strong>: profilo pubblico visibile nel marketplace (nome, competenze, portfolio)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Fornitori di servizi</strong>: Firebase/Google Cloud per hosting e database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span><strong>Autorità</strong>: su richiesta legale (magistratura, forze dell&apos;ordine)</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3 italic">
              Non vendiamo né cediamo i tuoi dati a terze parti per scopi commerciali.
            </p>
          </section>

          <Separator />

          {/* Diritti GDPR */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">7. I Tuoi Diritti (GDPR)</h2>
            </div>
            <p className="text-base mb-3">Hai diritto a:</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg">
                <p className="font-semibold mb-1">✅ Accesso</p>
                <p className="text-xs">Ottenere copia dei tuoi dati</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-4 rounded-lg">
                <p className="font-semibold mb-1">✏️ Rettifica</p>
                <p className="text-xs">Correggere dati inesatti</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 p-4 rounded-lg">
                <p className="font-semibold mb-1">🗑️ Cancellazione</p>
                <p className="text-xs">Richiedere eliminazione dati</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-lg">
                <p className="font-semibold mb-1">🔒 Limitazione</p>
                <p className="text-xs">Limitare il trattamento</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 p-4 rounded-lg">
                <p className="font-semibold mb-1">📦 Portabilità</p>
                <p className="text-xs">Ricevere dati in formato leggibile</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-4 rounded-lg">
                <p className="font-semibold mb-1">🚫 Opposizione</p>
                <p className="text-xs">Opporti al trattamento</p>
              </div>
            </div>
            <p className="text-sm mt-4 text-muted-foreground">
              Per esercitare questi diritti, contattaci a: <strong className="text-primary">privacy@bimatch.it</strong>
            </p>
          </section>

          <Separator />

          {/* Sicurezza */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">8. Sicurezza dei Dati</h2>
            <p className="text-base mb-3">Implementiamo misure di sicurezza avanzate:</p>
            <ul className="space-y-2 text-sm">
              <li>🔐 Crittografia SSL/TLS per tutte le comunicazioni</li>
              <li>🔑 Password hashing con algoritmi sicuri (bcrypt)</li>
              <li>🛡️ Firewall e sistemi di protezione DDoS</li>
              <li>👁️ Monitoraggio accessi e audit log</li>
              <li>⏱️ Rate limiting e protezione brute-force</li>
              <li>📝 Backup regolari su Firebase</li>
            </ul>
          </section>

          <Separator />

          {/* Conservazione */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">9. Conservazione dei Dati</h2>
            <p className="text-sm">
              Conserviamo i dati per il tempo necessario alle finalità del trattamento e per adempimenti legali.
              Account inattivi per oltre <strong>24 mesi</strong> possono essere cancellati previo avviso.
            </p>
          </section>

          <Separator />

          {/* Cookie */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">10. Cookie e Tecnologie Simili</h2>
            <p className="text-sm">
              Utilizziamo cookie tecnici (necessari) e cookie analitici (opzionali con consenso).
              Puoi gestire le preferenze tramite il banner cookie o le impostazioni del browser.
            </p>
          </section>

          <Separator />

          {/* Minori */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">11. Protezione dei Minori</h2>
            <p className="text-sm">
              BIMatch è destinato a professionisti e aziende. Non raccogliamo intenzionalmente dati di minori di 18 anni.
            </p>
          </section>

          <Separator />

          {/* Contatti */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">12. Contatti</h2>
            </div>
            <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
              <p className="text-base mb-3">Per domande su questa Privacy Policy o per esercitare i tuoi diritti:</p>
              <div className="space-y-2 text-sm">
                <p><strong>Email Privacy</strong>: <a href="mailto:privacy@bimatch.it" className="text-primary hover:underline">privacy@bimatch.it</a></p>
                <p><strong>Email Supporto</strong>: <a href="mailto:support@bimatch.it" className="text-primary hover:underline">support@bimatch.it</a></p>
                <p><strong>Sede</strong>: [Indirizzo da specificare]</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Footer Note */}
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-900 dark:text-yellow-100 italic">
              ⚠️ <strong>Nota Legale</strong>: Questa privacy policy è conforme al GDPR e alla normativa italiana,
              ma si consiglia di farla revisionare da un legale specializzato per garantire piena conformità
              alle specifiche esigenze di BIMatch.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
