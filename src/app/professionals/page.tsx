
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfessionalCard from '@/components/ProfessionalCard';
import type { ProfessionalMarketplaceProfile } from '@/types/marketplace';
import type { ProfessionalProfile as FullProfessionalProfile } from '@/types/auth';
import { BIM_SKILLS_OPTIONS, ITALIAN_REGIONS, EXPERIENCE_LEVEL_OPTIONS, AVAILABILITY_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS } from '@/constants';
import { Filter, Search, Users, X, WifiOff } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';


const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__";

const mapFirestoreDocToMarketplaceProfile = (docData: FullProfessionalProfile): ProfessionalMarketplaceProfile => {
  return {
    id: docData.uid,
    displayName: docData.displayName || `${docData.firstName || ''} ${docData.lastName || ''}`.trim() || 'Professionista Anonimo',
    photoURL: docData.photoURL || undefined,
    location: docData.location || 'Localizzazione non specificata',
    bimSkills: docData.bimSkills || [],
    experienceLevel: docData.experienceLevel || undefined,
    availability: docData.availability || undefined,
    tagline: docData.bio ? (docData.bio.length > 150 ? docData.bio.substring(0, 147) + "..." : docData.bio) : undefined,
    keySoftware: docData.softwareProficiency ? docData.softwareProficiency.slice(0, 3) : [], // Take top 3 for card
    alboRegistrationUrl: docData.alboRegistrationUrl,
    alboSelfCertified: docData.alboSelfCertified,
    uniCertificationUrl: docData.uniCertificationUrl,
    uniSelfCertified: docData.uniSelfCertified,
    otherCertificationsUrl: docData.otherCertificationsUrl,
    otherCertificationsSelfCertified: docData.otherCertificationsSelfCertified,
  };
};


export default function ProfessionalsMarketplacePage() {
  const { db } = useFirebase();
  const [professionals, setProfessionals] = useState<ProfessionalMarketplaceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skill: ALL_ITEMS_FILTER_VALUE,
    location: ALL_ITEMS_FILTER_VALUE,
    experience: ALL_ITEMS_FILTER_VALUE,
    availability: ALL_ITEMS_FILTER_VALUE,
  });

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('role', '==', 'professional'));
        const querySnapshot = await getDocs(q);
        const fetchedProfessionals: ProfessionalMarketplaceProfile[] = [];
        querySnapshot.forEach((doc) => {
          // Ensure data conforms to FullProfessionalProfile before mapping
          const data = doc.data() as FullProfessionalProfile;
          // Basic check to ensure it's a professional profile, though 'where' clause should handle it
          if (data.role === 'professional') {
            fetchedProfessionals.push(mapFirestoreDocToMarketplaceProfile(data));
          }
        });
        setProfessionals(fetchedProfessionals);
      } catch (e: any) {
        console.error("Error fetching professionals:", e);
        setError(e.message.includes('offline') || e.message.includes('Failed to get document because the client is offline') ? 'Impossibile caricare i profili. Controlla la tua connessione internet.' : 'Errore nel caricamento dei profili.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [db]);

  const filteredProfessionals = useMemo(() => {
    return professionals.filter(prof => {
      const nameMatch = prof.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || (prof.tagline && prof.tagline.toLowerCase().includes(searchTerm.toLowerCase()));
      const skillMatch = filters.skill === ALL_ITEMS_FILTER_VALUE || (prof.bimSkills && prof.bimSkills.includes(filters.skill));
      const locationMatch = filters.location === ALL_ITEMS_FILTER_VALUE || (prof.location && prof.location.toLowerCase().includes(filters.location.toLowerCase()));
      const experienceMatch = filters.experience === ALL_ITEMS_FILTER_VALUE || prof.experienceLevel === filters.experience;
      const availabilityMatch = filters.availability === ALL_ITEMS_FILTER_VALUE || prof.availability === filters.availability;
      return nameMatch && skillMatch && locationMatch && experienceMatch && availabilityMatch;
    });
  }, [professionals, searchTerm, filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ 
      skill: ALL_ITEMS_FILTER_VALUE, 
      location: ALL_ITEMS_FILTER_VALUE, 
      experience: ALL_ITEMS_FILTER_VALUE, 
      availability: ALL_ITEMS_FILTER_VALUE 
    });
  };

  const activeFilterCount = Object.values(filters).filter(val => val !== ALL_ITEMS_FILTER_VALUE).length + (searchTerm ? 1 : 0);


  return (
    <div className="space-y-8">
      <Card className="shadow-xl bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Trova Professionisti BIM</CardTitle>
              <CardDescription className="text-lg">Esplora i profili dei migliori talenti BIM in Italia.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full mb-6">
            <AccordionItem value="filters">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center">
                 <Filter className="mr-2 h-5 w-5 text-primary"/> Filtri di Ricerca 
                 {activeFilterCount > 0 && <Badge variant="secondary" className="ml-2">{activeFilterCount} attivi</Badge>}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Cerca per nome, tagline o parola chiave..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-full" 
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select value={filters.skill} onValueChange={(value) => handleFilterChange('skill', value || ALL_ITEMS_FILTER_VALUE)}>
                      <SelectTrigger><SelectValue placeholder="Competenza BIM" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutte le competenze</SelectItem>
                        {BIM_SKILLS_OPTIONS.map(skill => <SelectItem key={skill.value} value={skill.value}>{skill.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value || ALL_ITEMS_FILTER_VALUE)}>
                      <SelectTrigger><SelectValue placeholder="Localizzazione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutte le regioni</SelectItem>
                        {ITALIAN_REGIONS.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value || ALL_ITEMS_FILTER_VALUE)}>
                      <SelectTrigger><SelectValue placeholder="Livello Esperienza" /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Qualsiasi esperienza</SelectItem>
                        {EXPERIENCE_LEVEL_OPTIONS.map(exp => <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value || ALL_ITEMS_FILTER_VALUE)}>
                      <SelectTrigger><SelectValue placeholder="Disponibilità" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Qualsiasi disponibilità</SelectItem>
                        {AVAILABILITY_OPTIONS.map(avail => <SelectItem key={avail.value} value={avail.value}>{avail.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                     <Button variant="ghost" onClick={clearFilters} disabled={activeFilterCount === 0}>
                        <X className="mr-2 h-4 w-4" />  Resetta Filtri
                     </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="flex flex-col h-full shadow-lg">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-5/6 mt-1" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <div>
                        <Skeleton className="h-3 w-1/3 mb-1.5" />
                        <div className="flex flex-wrap gap-1.5">
                          <Skeleton className="h-5 w-1/4 rounded-full" />
                          <Skeleton className="h-5 w-1/3 rounded-full" />
                          <Skeleton className="h-5 w-1/4 rounded-full" />
                        </div>
                      </div>
                       <div>
                        <Skeleton className="h-3 w-1/3 mb-1.5" />
                        <div className="flex flex-wrap gap-1.5">
                          <Skeleton className="h-5 w-1/4 rounded-full" />
                           <Skeleton className="h-5 w-1/3 rounded-full" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t mt-auto">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : error ? (
             <div className="text-center py-16 border-2 border-dashed rounded-lg border-destructive/50 bg-destructive/5">
              <WifiOff className="mx-auto h-16 w-16 text-destructive mb-6" />
              <p className="text-xl font-semibold mb-2 text-destructive">{error}</p>
              <p className="text-muted-foreground">Riprova più tardi o contatta il supporto se il problema persiste.</p>
            </div>
          ) : filteredProfessionals.length > 0 ? (
            <TooltipProvider delayDuration={200}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProfessionals.map((prof) => (
                  <ProfessionalCard key={prof.id} professional={prof} />
                ))}
              </div>
            </TooltipProvider>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <p className="text-xl font-semibold mb-2">Nessun professionista trovato.</p>
              <p className="text-muted-foreground">Prova a modificare i filtri o a controllare più tardi.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
