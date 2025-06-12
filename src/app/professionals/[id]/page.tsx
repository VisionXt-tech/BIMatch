
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import type { ProfessionalProfile } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, Laptop, DollarSign, Linkedin, ExternalLink, FileText, Settings, CalendarDays, UserCircle2, WifiOff, Award, BadgeCheck, Link as LinkIcon } from 'lucide-react';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, AVAILABILITY_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, ROUTES } from '@/constants';
import Image from 'next/image'; 
import { cn } from '@/lib/utils';

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'P';
  const names = name.split(' ');
  if (names.length > 1 && names[0] && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getLabelForValue = (options: { value: string; label: string }[], value?: string): string | undefined => {
  return options.find(opt => opt.value === value)?.label;
};


export default function ProfessionalProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const { db } = useFirebase();
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const professionalId = typeof params?.id === 'string' ? params.id : null;

  useEffect(() => {
    if (professionalId) {
      const fetchProfessionalProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const userDocRef = doc(db, 'users', professionalId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data()?.role === 'professional') {
            const profileData = userDocSnap.data() as ProfessionalProfile;
            setProfessional(profileData);
          } else {
            setError('Profilo non trovato o non valido.');
            setProfessional(null);
          }
        } catch (e: any) {
          console.error("Error fetching professional profile:", e);
          let errorMessage = 'Errore nel caricamento del profilo.';
          if (typeof e.message === 'string' && (e.message.includes('offline') || e.message.includes('Failed to get document because the client is offline'))) {
            errorMessage = 'Impossibile caricare il profilo. Controlla la tua connessione internet e riprova.';
          } else if (typeof e.message === 'string') {
            errorMessage = e.message;
          }
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchProfessionalProfile();
    } else {
      setLoading(false);
      setError("ID del professionista non specificato.");
    }
  }, [professionalId, db]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-muted-foreground mt-4">Caricamento profilo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 flex flex-col items-center space-y-4 bg-destructive/10 p-8 rounded-lg">
        <WifiOff className="h-16 w-16 text-destructive" />
        <p className="text-destructive text-xl font-semibold">Errore di Caricamento</p>
        <p className="text-destructive/80 text-md max-w-md">{error}</p>
        <Button onClick={() => router.push(ROUTES.PROFESSIONALS_MARKETPLACE)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna al Marketplace
        </Button>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground text-lg">Profilo non disponibile.</p>
         <Button onClick={() => router.push(ROUTES.PROFESSIONALS_MARKETPLACE)} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna al Marketplace
        </Button>
      </div>
    );
  }

  const experienceLabel = getLabelForValue(EXPERIENCE_LEVEL_OPTIONS, professional.experienceLevel);
  const availabilityLabel = getLabelForValue(AVAILABILITY_OPTIONS, professional.availability);
  const isImmediata = availabilityLabel === AVAILABILITY_OPTIONS.find(opt => opt.value === 'immediata')?.label;

  const hasCertifications = professional.alboRegistrationUrl || professional.uniCertificationUrl || professional.otherCertificationsUrl;

  return (
    <div className="container mx-auto px-2 py-8 md:px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Torna Indietro
      </Button>
      <Card className="shadow-xl border">
        <CardHeader className="p-6 md:p-8 border-b flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-2 border-primary/50 shadow-md shrink-0">
              <AvatarImage src={professional.photoURL || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOHx8YXJjaGl0ZWN0fGVufDB8fHx8MTc0NzM5OTM5OXww&ixlib=rb-4.1.0&q=80&w=1080"} alt={professional.displayName || 'Professionista'} data-ai-hint="profile person" />
              <AvatarFallback className="text-3xl md:text-4xl bg-muted">{getInitials(professional.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{professional.displayName}</CardTitle>
                {professional.location && (
                    <div className="flex items-center text-md text-muted-foreground mt-1.5">
                    <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-primary/80" /> {professional.location}
                    </div>
                )}
            </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-6 pb-6">
          <div className="md:col-span-2 space-y-6">
            {professional.bio && (
              <Card className="shadow-sm border bg-background">
                <CardHeader><CardTitle className="text-xl flex items-center text-foreground/90"><UserCircle2 className="mr-3 h-6 w-6 text-primary"/> Bio Professionale</CardTitle></CardHeader>
                <CardContent><p className="text-foreground/80 whitespace-pre-line leading-relaxed">{professional.bio}</p></CardContent>
              </Card>
            )}

            {professional.bimSkills && professional.bimSkills.length > 0 && (
              <Card className="shadow-sm border bg-background">
                <CardHeader><CardTitle className="text-xl flex items-center text-foreground/90"><Settings className="mr-3 h-6 w-6 text-primary"/> Competenze BIM</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {professional.bimSkills.map(skillKey => {
                    const skill = getLabelForValue(BIM_SKILLS_OPTIONS, skillKey);
                    return skill ? <Badge key={skillKey} variant="secondary" className="text-sm py-1 px-3 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 transition-colors">{skill}</Badge> : null;
                  })}
                </CardContent>
              </Card>
            )}

            {professional.softwareProficiency && professional.softwareProficiency.length > 0 && (
              <Card className="shadow-sm border bg-background">
                <CardHeader><CardTitle className="text-xl flex items-center text-foreground/90"><Laptop className="mr-3 h-6 w-6 text-primary"/> Software BIM Utilizzati</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {professional.softwareProficiency.map(swKey => {
                    const software = getLabelForValue(SOFTWARE_PROFICIENCY_OPTIONS, swKey);
                    return software ? <Badge key={swKey} variant="outline" className="text-sm py-1 px-3 border-muted-foreground/50 text-muted-foreground hover:bg-muted/80 transition-colors">{software}</Badge> : null;
                  })}
                </CardContent>
              </Card>
            )}

            {hasCertifications && (
              <Card className="shadow-sm border bg-background">
                <CardHeader><CardTitle className="text-xl flex items-center text-foreground/90"><Award className="mr-3 h-6 w-6 text-primary"/> Certificazioni</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {professional.alboRegistrationUrl && (
                    <Button variant="outline" asChild className="w-full justify-start group hover:border-primary/50 hover:bg-primary/5">
                      <Link href={professional.alboRegistrationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/90">
                        <FileText className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" /> Iscrizione Albo Professionale
                      </Link>
                    </Button>
                  )}
                  {professional.uniCertificationUrl && (
                    <Button variant="outline" asChild className="w-full justify-start group hover:border-primary/50 hover:bg-primary/5">
                      <Link href={professional.uniCertificationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/90">
                        <BadgeCheck className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" /> Certificazione UNI
                      </Link>
                    </Button>
                  )}
                  {professional.otherCertificationsUrl && (
                    <Button variant="outline" asChild className="w-full justify-start group hover:border-primary/50 hover:bg-primary/5">
                      <Link href={professional.otherCertificationsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/90">
                        <LinkIcon className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" /> Altre Certificazioni
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}


          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border bg-background">
                <CardHeader><CardTitle className="text-xl text-foreground/90">Dettagli Chiave</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {experienceLabel && (
                        <div className="flex items-start">
                            <Briefcase className="h-5 w-5 mr-3 mt-0.5 text-primary flex-shrink-0"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Livello Esperienza</p>
                                <p className="font-medium text-foreground/90">{experienceLabel}</p>
                            </div>
                        </div>
                    )}
                    {availabilityLabel && (
                        <div className="flex items-start">
                            <CalendarDays className="h-5 w-5 mr-3 mt-0.5 text-primary flex-shrink-0"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Disponibilità</p>
                                <p className={cn(
                                    "font-medium text-foreground/90",
                                    isImmediata && "text-green-600 font-semibold"
                                )}>
                                    {availabilityLabel}
                                </p>
                            </div>
                        </div>
                    )}
                    {professional.monthlyRate != null && String(professional.monthlyRate).trim() !== '' && !isNaN(Number(professional.monthlyRate)) && (
                        <div className="flex items-start">
                            <DollarSign className="h-5 w-5 mr-3 mt-0.5 text-primary flex-shrink-0"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Retribuzione Mensile Lorda (Indicativa)</p>
                                <p className="font-medium text-foreground/90">€ {Number(professional.monthlyRate).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
             <Card className="shadow-sm border bg-background">
                <CardHeader><CardTitle className="text-xl text-foreground/90">Link Professionali</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {professional.portfolioUrl && (
                        <Button variant="outline" asChild className="w-full justify-start group hover:border-primary/50 hover:bg-primary/5">
                        <Link href={professional.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/90">
                            <ExternalLink className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" /> Portfolio Personale
                        </Link>
                        </Button>
                    )}
                    {professional.cvUrl && (
                        <Button variant="outline" asChild className="w-full justify-start group hover:border-primary/50 hover:bg-primary/5">
                        <Link href={professional.cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/90">
                            <FileText className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" /> Curriculum Vitae
                        </Link>
                        </Button>
                    )}
                    {professional.linkedInProfile && (
                        <Button variant="outline" asChild className="w-full justify-start group hover:border-primary/50 hover:bg-primary/5">
                        <Link href={professional.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/90">
                            <Linkedin className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" /> Profilo LinkedIn
                        </Link>
                        </Button>
                    )}
                     {(!professional.portfolioUrl && !professional.cvUrl && !professional.linkedInProfile) && (
                        <p className="text-sm text-muted-foreground italic text-center py-2">Nessun link esterno fornito.</p>
                     )}
                </CardContent>
            </Card>

            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled>
              Contatta {professional.firstName || 'il Professionista'} (Prossimamente)
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 pb-4 bg-muted/50">
            <p className="text-xs text-muted-foreground">
                Ultimo aggiornamento profilo: {professional.updatedAt && typeof (professional.updatedAt as any).toDate === 'function' ? (professional.updatedAt as any).toDate().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Data non disponibile'}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
