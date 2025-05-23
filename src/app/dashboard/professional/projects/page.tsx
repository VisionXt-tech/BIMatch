
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, ITALIAN_REGIONS, ROUTES } from '@/constants';
import { Briefcase, MapPin, Percent, Search, Filter, Construction, Code2, WifiOff, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Project } from '@/types/project'; // Assicurati che Project sia definito correttamente
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, Timestamp, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const getSkillLabel = (value: string) => BIM_SKILLS_OPTIONS.find(s => s.value === value)?.label || value;
const getSoftwareLabel = (value: string) => SOFTWARE_PROFICIENCY_OPTIONS.find(s => s.value === value)?.label || value;

export default function AvailableProjectsPage() {
  const { db } = useFirebase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementare la logica di filtraggio effettiva
  const [filters, setFilters] = useState({
    skill: '',
    software: '',
    location: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      if (!db) {
        setError("Database non disponibile.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const projectsCollectionRef = collection(db, 'projects');
        // Ordina per data di pubblicazione, i più recenti prima
        const q = query(projectsCollectionRef, orderBy('postedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(fetchedProjects);
      } catch (e: any) {
        console.error("Error fetching projects:", e);
        setError(e.message.includes('offline') ? "Connessione persa. Controlla la tua rete." : "Errore nel caricamento dei progetti.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [db]);

  // Placeholder per la logica di filtraggio - attualmente non applicata
  const filteredProjects = projects; // Sostituire con la logica di filtraggio effettiva

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">Progetti Disponibili</CardTitle>
              <CardDescription>Esplora le opportunità BIM che corrispondono al tuo profilo.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full mb-6 border rounded-lg bg-muted/50 px-4">
              <AccordionItem value="filters" className="border-b-0">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-5 w-5 text-primary"/> Filtri Avanzati (Non Attivi)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <Select onValueChange={(value) => setFilters(prev => ({...prev, skill: value}))} value={filters.skill}>
                          <SelectTrigger><SelectValue placeholder="Competenza BIM" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="">Tutte le competenze</SelectItem>
                              {BIM_SKILLS_OPTIONS.map(skill => <SelectItem key={skill.value} value={skill.value}>{skill.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => setFilters(prev => ({...prev, software: value}))} value={filters.software}>
                          <SelectTrigger><SelectValue placeholder="Software" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="">Tutti i software</SelectItem>
                              {SOFTWARE_PROFICIENCY_OPTIONS.map(sw => <SelectItem key={sw.value} value={sw.value}>{sw.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => setFilters(prev => ({...prev, location: value}))} value={filters.location}>
                          <SelectTrigger><SelectValue placeholder="Localizzazione" /></SelectTrigger>
                          <SelectContent>
                               <SelectItem value="">Tutte le regioni</SelectItem>
                              {ITALIAN_REGIONS.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Button className="w-full" disabled><Search className="mr-2 h-4 w-4" /> Applica Filtri (TODO)</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="shadow-lg">
                    <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
                    <CardContent className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-8 w-1/3" /></CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                  </Card>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg">
              <WifiOff className="mx-auto h-16 w-16 text-destructive mb-6" />
              <p className="text-xl font-semibold mb-2 text-destructive">Errore di Caricamento</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <CardTitle className="text-xl hover:text-primary transition-colors">
                                <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>{project.title}</Link>
                            </CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground mt-1.5">
                                {project.companyLogo ? 
                                    <Image data-ai-hint="company logo" src={project.companyLogo} alt={`${project.companyName} logo`} width={20} height={20} className="mr-2 rounded-sm border" />
                                    : <Briefcase className="h-4 w-4 mr-2 flex-shrink-0"/> 
                                }
                                <span>{project.companyName}</span>
                                <span className="mx-2">·</span>
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{project.location}</span>
                            </div>
                        </div>
                        {/* Placeholder for compatibility score if implemented
                        {project.compatibility && (
                             <div className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full whitespace-nowrap mt-1 sm:mt-0">
                                <Percent className="h-3.5 w-3.5 mr-1" /> {project.compatibility}% Compatibile
                            </div>
                        )}
                        */}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{project.description}</p>
                    {project.requiredSkills && project.requiredSkills.length > 0 && (
                      <div className="mb-3">
                          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><Construction className="h-3.5 w-3.5 mr-1.5 text-primary/80"/>Competenze Richieste:</h4>
                          <div className="flex flex-wrap gap-2">
                              {project.requiredSkills.slice(0,3).map(skillKey => (
                                  <span key={skillKey} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">{getSkillLabel(skillKey)}</span>
                              ))}
                              {project.requiredSkills.length > 3 && <span className="text-xs text-muted-foreground self-center">+{project.requiredSkills.length - 3} altro/i</span>}
                          </div>
                      </div>
                    )}
                     {project.requiredSoftware && project.requiredSoftware.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><Code2 className="h-3.5 w-3.5 mr-1.5 text-primary/80"/>Software Richiesti:</h4>
                            <div className="flex flex-wrap gap-2">
                                {project.requiredSoftware.slice(0,3).map(swKey => (
                                    <span key={swKey} className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">{getSoftwareLabel(swKey)}</span>
                                ))}
                                {project.requiredSoftware.length > 3 && <span className="text-xs text-muted-foreground self-center">+{project.requiredSoftware.length - 3} altro/i</span>}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Pubblicato: {project.postedAt && (project.postedAt as Timestamp).toDate ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT') : 'Data non disponibile'}
                        </p>
                        <Button size="sm" asChild>
                            <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>Dettagli e Candidatura</Link>
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* TODO: Pagination */}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">Nessun progetto disponibile al momento.</p>
              <p className="text-muted-foreground">Controlla più tardi o amplia i tuoi criteri di ricerca.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
