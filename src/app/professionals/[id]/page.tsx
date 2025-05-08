
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import type { ProfessionalProfile } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, Laptop, Users, DollarSign, Linkedin, ExternalLink, FileText, Settings, CalendarDays, CheckCircle, UserCircle2 } from 'lucide-react';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, AVAILABILITY_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, ITALIAN_REGIONS, ROUTES } from '@/constants';
import Image from 'next/image';

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

  const professionalId = params?.id as string;

  useEffect(() => {
    if (professionalId) {
      const fetchProfessionalProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const userDocRef = doc(db, 'users', professionalId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data()?.role === 'professional') {
            setProfessional(userDocSnap.data() as ProfessionalProfile);
          } else {
            setError('Profilo non trovato o non valido.');
            setProfessional(null);
          }
        } catch (e: any) {
          console.error("Error fetching professional profile:", e);
          setError(e.message || 'Errore nel caricamento del profilo.');
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
      <div className="text-center py-10">
        <p className="text-destructive text-lg">{error}</p>
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
         <Button onClick={() => router.push(ROUTES.PROFESSIONALS_MARKETPLACE)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna al Marketplace
        </Button>
      </div>
    );
  }

  const experienceLabel = getLabelForValue(EXPERIENCE_LEVEL_OPTIONS, professional.experienceLevel);
  const availabilityLabel = getLabelForValue(AVAILABILITY_OPTIONS, professional.availability);

  return (
    <div className="container mx-auto px-2 py-8 md:px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Torna Indietro
      </Button>
      <Card className="shadow-xl overflow-hidden">
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-background to-secondary/20">
           <Image 
              src={`https://picsum.photos/seed/${professional.uid}bg/1200/300`} 
              alt="Copertina profilo" 
              layout="fill" 
              objectFit="cover"
              className="opacity-50"
              data-ai-hint="abstract background"
            />
           <div className="absolute inset-0 flex items-end p-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-card shadow-lg">
              <AvatarImage src={professional.photoURL || `https://picsum.photos/seed/${professional.uid}/200/200`} alt={professional.displayName || 'Professionista'} data-ai-hint="profile person" />
              <AvatarFallback className="text-4xl">{getInitials(professional.displayName)}</AvatarFallback>
            </Avatar>
           </div>
        </div>
        
        <CardHeader className="pt-8 md:pt-12">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{professional.displayName}</CardTitle>
          {professional.location && (
            <CardDescription className="flex items-center text-md text-muted-foreground mt-1">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-primary/80" /> {professional.location}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-2 pb-6">
          {/* Colonna sinistra: Info principali e Bio */}
          <div className="md:col-span-2 space-y-6">
            {professional.bio && (
              <Card className="shadow-md">
                <CardHeader><CardTitle className="text-xl flex items-center"><UserCircle2 className="mr-2 h-5 w-5 text-primary"/> Bio</CardTitle></CardHeader>
                <CardContent><p className="text-foreground/90 whitespace-pre-line">{professional.bio}</p></CardContent>
              </Card>
            )}

            {professional.bimSkills && professional.bimSkills.length > 0 && (
              <Card className="shadow-md">
                <CardHeader><CardTitle className="text-xl flex items-center"><Settings className="mr-2 h-5 w-5 text-primary"/> Competenze BIM</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {professional.bimSkills.map(skillKey => {
                    const skill = getLabelForValue(BIM_SKILLS_OPTIONS, skillKey);
                    return skill ? <Badge key={skillKey} variant="secondary" className="text-sm py-1 px-3 bg-primary/10 text-primary border-primary/30">{skill}</Badge> : null;
                  })}
                </CardContent>
              </Card>
            )}

            {professional.softwareProficiency && professional.softwareProficiency.length > 0 && (
              <Card className="shadow-md">
                <CardHeader><CardTitle className="text-xl flex items-center"><Laptop className="mr-2 h-5 w-5 text-primary"/> Software BIM Utilizzati</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {professional.softwareProficiency.map(swKey => {
                    const software = getLabelForValue(SOFTWARE_PROFICIENCY_OPTIONS, swKey);
                    return software ? <Badge key={swKey} variant="outline" className="text-sm py-1 px-3">{software}</Badge> : null;
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonna destra: Dettagli e Contatti */}
          <div className="space-y-6">
            <Card className="shadow-md">
                <CardHeader><CardTitle className="text-xl">Dettagli</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {experienceLabel && (
                        <div className="flex items-center">
                            <Briefcase className="h-5 w-5 mr-3 text-primary"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Livello Esperienza</p>
                                <p className="font-medium">{experienceLabel}</p>
                            </div>
                        </div>
                    )}
                    {availabilityLabel && (
                        <div className="flex items-center">
                            <CalendarDays className="h-5 w-5 mr-3 text-primary"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Disponibilità</p>
                                <p className="font-medium">{availabilityLabel}</p>
                            </div>
                        </div>
                    )}
                    {professional.hourlyRate && (
                        <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-3 text-primary"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Tariffa Oraria (Indicativa)</p>
                                <p className="font-medium">€{professional.hourlyRate}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
             <Card className="shadow-md">
                <CardHeader><CardTitle className="text-xl">Link Esterni</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {professional.portfolioUrl && (
                        <Button variant="outline" asChild className="w-full justify-start">
                        <Link href={professional.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Portfolio
                        </Link>
                        </Button>
                    )}
                    {professional.cvUrl && (
                        <Button variant="outline" asChild className="w-full justify-start">
                        <Link href={professional.cvUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" /> Curriculum Vitae
                        </Link>
                        </Button>
                    )}
                    {professional.linkedInProfile && (
                        <Button variant="outline" asChild className="w-full justify-start">
                        <Link href={professional.linkedInProfile} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="mr-2 h-4 w-4" /> Profilo LinkedIn
                        </Link>
                        </Button>
                    )}
                     {(!professional.portfolioUrl && !professional.cvUrl && !professional.linkedInProfile) && (
                        <p className="text-sm text-muted-foreground">Nessun link esterno fornito.</p>
                     )}
                </CardContent>
            </Card>

            {/* Placeholder for contact button - actual messaging to be implemented */}
            <Button className="w-full" size="lg" disabled>
              Contatta {professional.firstName || 'il Professionista'} (Prossimamente)
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <p className="text-xs text-muted-foreground">
                Profilo verificato il: {professional.updatedAt && typeof professional.updatedAt.toDate === 'function' ? professional.updatedAt.toDate().toLocaleDateString('it-IT') : 'Data non disponibile'}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    