'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfessionalCard from '@/components/ProfessionalCard';
import type { ProfessionalMarketplaceProfile } from '@/types/marketplace';
import { BIM_SKILLS_OPTIONS, ITALIAN_REGIONS, EXPERIENCE_LEVEL_OPTIONS, AVAILABILITY_OPTIONS } from '@/constants';
import { Filter, Search, Users, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const mockProfessionals: ProfessionalMarketplaceProfile[] = [
  {
    id: 'prof1',
    displayName: 'Mario Rossi',
    photoURL: 'https://picsum.photos/seed/prof1/100/100',
    location: 'Milano, Lombardia',
    bimSkills: ['modellazione-architettonica', 'bim-coordination', 'autodesk-revit', 'rendering-visualizzazione'],
    experienceLevel: 'senior',
    availability: 'immediata',
    tagline: 'Architetto BIM Senior con 10+ anni di esperienza in progetti complessi. Specializzato in Revit e Navisworks.',
    keySoftware: ['autodesk-revit', 'autodesk-navisworks', 'lumion'],
  },
  {
    id: 'prof2',
    displayName: 'Laura Bianchi',
    photoURL: 'https://picsum.photos/seed/prof2/100/100',
    location: 'Roma, Lazio',
    bimSkills: ['modellazione-mep', 'clash-detection', 'graphisoft-archicad'],
    experienceLevel: 'mid',
    availability: '1-mese',
    tagline: 'Ingegnere MEP esperta in coordinamento BIM e clash detection. Competente in ArchiCAD e Solibri.',
     keySoftware: ['graphisoft-archicad', 'solibri-model-checker'],
  },
  {
    id: 'prof3',
    displayName: 'Giovanni Verdi',
    location: 'Napoli, Campania',
    bimSkills: ['modellazione-strutturale', 'tekla-structures'],
    experienceLevel: 'junior',
    availability: '2-settimane',
    tagline: 'Giovane e motivato ingegnere strutturale BIM, specializzato in Tekla Structures.',
    keySoftware: ['tekla-structures', 'autodesk-autocad'],
  },
   {
    id: 'prof4',
    displayName: 'Sofia Neri',
    photoURL: 'https://picsum.photos/seed/prof4/100/100',
    location: 'Firenze, Toscana',
    bimSkills: ['bim-management', 'programmazione-lavori-4d', 'computi-metrici-bim'],
    experienceLevel: 'expert',
    availability: 'da-concordare',
    tagline: 'BIM Manager certificata con vasta esperienza nella gestione di grandi progetti e implementazione di standard BIM.',
    keySoftware: ['autodesk-revit', 'synchro-4d', 'trimble-connect'],
  },
];


export default function ProfessionalsMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skill: '',
    location: '',
    experience: '',
    availability: '',
  });

  // TODO: Implement actual data fetching and filtering logic
  const filteredProfessionals = mockProfessionals.filter(prof => {
    const nameMatch = prof.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = !filters.skill || prof.bimSkills.includes(filters.skill);
    const locationMatch = !filters.location || prof.location.toLowerCase().includes(filters.location.toLowerCase());
    const experienceMatch = !filters.experience || prof.experienceLevel === filters.experience;
    const availabilityMatch = !filters.availability || prof.availability === filters.availability;
    return nameMatch && skillMatch && locationMatch && experienceMatch && availabilityMatch;
  });

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ skill: '', location: '', experience: '', availability: '' });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);


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
                    placeholder="Cerca per nome o parola chiave..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-full" 
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select value={filters.skill} onValueChange={(value) => handleFilterChange('skill', value)}>
                      <SelectTrigger><SelectValue placeholder="Competenza BIM" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutte le competenze</SelectItem>
                        {BIM_SKILLS_OPTIONS.map(skill => <SelectItem key={skill.value} value={skill.value}>{skill.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                      <SelectTrigger><SelectValue placeholder="Localizzazione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutte le regioni</SelectItem>
                        {ITALIAN_REGIONS.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                      <SelectTrigger><SelectValue placeholder="Livello Esperienza" /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="">Qualsiasi esperienza</SelectItem>
                        {EXPERIENCE_LEVEL_OPTIONS.map(exp => <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
                      <SelectTrigger><SelectValue placeholder="Disponibilità" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Qualsiasi disponibilità</SelectItem>
                        {AVAILABILITY_OPTIONS.map(avail => <SelectItem key={avail.value} value={avail.value}>{avail.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                     <Button variant="ghost" onClick={clearFilters} disabled={activeFilterCount === 0}>
                        <X className="mr-2 h-4 w-4" />  Resetta Filtri
                     </Button>
                    {/* <Button><Search className="mr-2 h-4 w-4" /> Applica Filtri</Button> */}
                    {/* Filtering is live, so Apply button is not strictly necessary */}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {filteredProfessionals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProfessionals.map((prof) => (
                <ProfessionalCard key={prof.id} professional={prof} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <p className="text-xl font-semibold mb-2">Nessun professionista trovato.</p>
              <p className="text-muted-foreground">Prova a modificare i filtri o a controllare più tardi.</p>
            </div>
          )}
          {/* TODO: Pagination if many professionals */}
        </CardContent>
      </Card>
    </div>
  );
}
```