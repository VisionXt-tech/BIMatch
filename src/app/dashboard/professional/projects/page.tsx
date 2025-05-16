
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, ITALIAN_REGIONS } from '@/constants';
import { Briefcase, MapPin, Percent, Search, Filter, Construction, Code2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Placeholder project data structure
interface Project {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  requiredSkills: string[];
  requiredSoftware: string[];
  description: string;
  compatibility?: number; // Optional: matching percentage
  postedDate: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Modellatore BIM Architettonico Senior - Residenziale Lusso',
    companyName: 'Studio Architettura Innova',
    companyLogo: 'https://placehold.co/40x40.png',
    location: 'Milano, Lombardia',
    requiredSkills: ['modellazione-architettonica', 'bim-coordination', 'rendering-visualizzazione'],
    requiredSoftware: ['autodesk-revit', 'autodesk-navisworks', 'lumion'],
    description: 'Siamo alla ricerca di un Modellatore BIM Architettonico esperto per un prestigioso progetto residenziale nel centro di Milano. Il candidato ideale avrà una comprovata esperienza nella modellazione complessa e coordinamento BIM.',
    compatibility: 85,
    postedDate: '2 giorni fa',
  },
  {
    id: '2',
    title: 'BIM Coordinator per Grande Opera Infrastrutturale',
    companyName: 'Ingegneria Progetti Italia S.p.A.',
    companyLogo: 'https://placehold.co/40x40.png',
    location: 'Roma, Lazio',
    requiredSkills: ['bim-coordination', 'clash-detection', 'programmazione-lavori-4d'],
    requiredSoftware: ['autodesk-navisworks', 'synchro-4d', 'trimble-connect'],
    description: 'Opportunità unica per un BIM Coordinator di talento di unirsi al team per un\'importante opera infrastrutturale. Richiesta esperienza nella gestione di modelli federati e processi di clash detection.',
    compatibility: 70,
    postedDate: '5 giorni fa',
  },
  {
    id: '3',
    title: 'Specialista BIM MEP - Impianti Ospedalieri',
    companyName: 'Tech Solutions Edilizia',
    companyLogo: 'https://placehold.co/40x40.png',
    location: 'Napoli, Campania',
    requiredSkills: ['modellazione-mep', 'bim-coordination'],
    requiredSoftware: ['autodesk-revit', 'nemetschek-allplan'],
    description: 'Cerchiamo uno Specialista BIM MEP con esperienza specifica in impianti ospedalieri complessi. Il ruolo prevede la modellazione dettagliata e il coordinamento degli impianti.',
    compatibility: 92,
    postedDate: '1 settimana fa',
  },
];


export default function AvailableProjectsPage() {
  // TODO: Implement actual data fetching and filtering logic

  return (
    <div className="space-y-8">
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
                    <Filter className="mr-2 h-5 w-5 text-primary"/> Filtri Avanzati
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <Select>
                          <SelectTrigger><SelectValue placeholder="Competenza BIM" /></SelectTrigger>
                          <SelectContent>
                              {BIM_SKILLS_OPTIONS.map(skill => <SelectItem key={skill.value} value={skill.value}>{skill.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Select>
                          <SelectTrigger><SelectValue placeholder="Software" /></SelectTrigger>
                          <SelectContent>
                              {SOFTWARE_PROFICIENCY_OPTIONS.map(sw => <SelectItem key={sw.value} value={sw.value}>{sw.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Select>
                          <SelectTrigger><SelectValue placeholder="Localizzazione" /></SelectTrigger>
                          <SelectContent>
                              {ITALIAN_REGIONS.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Button className="w-full"><Search className="mr-2 h-4 w-4" /> Applica Filtri</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>


          {mockProjects.length > 0 ? (
            <div className="space-y-6">
              {mockProjects.map((project) => (
                <Card key={project.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <CardTitle className="text-xl hover:text-primary transition-colors">
                                <Link href={`/projects/${project.id}`}>{project.title}</Link>
                            </CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground mt-1.5">
                                {project.companyLogo && <Image data-ai-hint="company logo" src={project.companyLogo} alt={`${project.companyName} logo`} width={20} height={20} className="mr-2 rounded-full border" />}
                                <span>{project.companyName}</span>
                                <span className="mx-2">·</span>
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{project.location}</span>
                            </div>
                        </div>
                        {project.compatibility && (
                             <div className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full whitespace-nowrap mt-1 sm:mt-0">
                                <Percent className="h-3.5 w-3.5 mr-1" /> {project.compatibility}% Compatibile
                            </div>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{project.description}</p>
                    <div className="mb-3">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><Construction className="h-3.5 w-3.5 mr-1.5 text-primary/80"/>Competenze Richieste:</h4>
                        <div className="flex flex-wrap gap-2">
                            {project.requiredSkills.slice(0,3).map(skillKey => {
                                const skill = BIM_SKILLS_OPTIONS.find(s => s.value === skillKey);
                                return skill ? <span key={skillKey} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">{skill.label}</span> : null;
                            })}
                            {project.requiredSkills.length > 3 && <span className="text-xs text-muted-foreground self-center">+{project.requiredSkills.length - 3} altro</span>}
                        </div>
                    </div>
                     <div className="mb-4">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><Code2 className="h-3.5 w-3.5 mr-1.5 text-primary/80"/>Software Richiesti:</h4>
                        <div className="flex flex-wrap gap-2">
                            {project.requiredSoftware.slice(0,3).map(swKey => {
                                const software = SOFTWARE_PROFICIENCY_OPTIONS.find(s => s.value === swKey);
                                return software ? <span key={swKey} className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">{software.label}</span> : null;
                            })}
                             {project.requiredSoftware.length > 3 && <span className="text-xs text-muted-foreground self-center">+{project.requiredSoftware.length - 3} altro</span>}
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">Pubblicato: {project.postedDate}</p>
                        <Button size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>Dettagli e Candidatura</Link>
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* TODO: Pagination */}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">Nessun progetto trovato.</p>
              <p className="text-muted-foreground">Prova a modificare i filtri o controlla più tardi.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
