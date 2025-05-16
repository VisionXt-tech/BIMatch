
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Edit3, Trash2, Eye, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Badge } from '@/components/ui/badge';

// Placeholder project data structure
interface CompanyProject {
  id: string;
  title: string;
  status: 'attivo' | 'in_revisione' | 'completato' | 'chiuso';
  candidatesCount: number;
  postedDate: string;
  location: string;
}

const mockCompanyProjects: CompanyProject[] = [
  {
    id: '101',
    title: 'Progetto Pilota Smart Building - Modellazione BIM',
    status: 'attivo',
    candidatesCount: 15,
    postedDate: '1 settimana fa',
    location: 'Milano',
  },
  {
    id: '102',
    title: 'Coordinamento BIM per Complesso Commerciale',
    status: 'attivo',
    candidatesCount: 8,
    postedDate: '3 giorni fa',
    location: 'Roma',
  },
  {
    id: '103',
    title: 'Sviluppo Famiglie Revit Parametriche Personalizzate',
    status: 'completato',
    candidatesCount: 5, // Candidates for a completed project might mean those who applied
    postedDate: '1 mese fa',
    location: 'Remoto',
  },
   {
    id: '104',
    title: 'Implementazione CDE per Studio di Architettura',
    status: 'in_revisione',
    candidatesCount: 0,
    postedDate: '2 giorni fa',
    location: 'Firenze',
  },
];

const getStatusBadgeVariant = (status: CompanyProject['status']) => {
  switch (status) {
    case 'attivo': return 'default'; 
    case 'in_revisione': return 'secondary'; 
    case 'completato': return 'outline'; 
    case 'chiuso': return 'destructive';
    default: return 'default';
  }
};
const getStatusBadgeText = (status: CompanyProject['status']) => {
  switch (status) {
    case 'attivo': return 'Attivo';
    case 'in_revisione': return 'In Revisione';
    case 'completato': return 'Completato';
    case 'chiuso': return 'Chiuso';
    default: return status;
  }
}


export default function CompanyProjectsPage() {
  // TODO: Implement actual data fetching for company's projects

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">I Miei Progetti Pubblicati</CardTitle>
              <CardDescription>Gestisci i tuoi progetti BIM, visualizza le candidature e trova i migliori talenti.</CardDescription>
            </div>
            <Button asChild>
                <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}><PlusCircle className="mr-2 h-4 w-4" /> Pubblica Nuovo Progetto</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mockCompanyProjects.length > 0 ? (
            <div className="space-y-6">
              {mockCompanyProjects.map((project) => (
                <Card key={project.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                            <CardTitle className="text-xl hover:text-primary transition-colors">
                                <Link href={`/projects/${project.id}`}>{project.title}</Link>
                            </CardTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                                Pubblicato: {project.postedDate} - Località: {project.location}
                            </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(project.status)} className="mt-2 sm:mt-0 text-xs">
                            {getStatusBadgeText(project.status)}
                        </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{project.candidatesCount} Candidati</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={ROUTES.PROJECT_DETAILS(project.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Visualizza
                        </Link>
                      </Button>
                       <Button size="sm" variant="outline" asChild>
                        <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}/${project.id}/edit`}> 
                          <Edit3 className="mr-2 h-4 w-4" /> Modifica
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`${ROUTES.DASHBOARD_COMPANY_CANDIDATES}?projectId=${project.id}`}> 
                          <Users className="mr-2 h-4 w-4" /> Vedi Candidati ({project.candidatesCount})
                        </Link>
                      </Button>
                      <Button size="sm" variant="destructive" disabled={project.status === 'completato' || project.status === 'chiuso'}>
                        <Trash2 className="mr-2 h-4 w-4" /> Chiudi Progetto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* TODO: Pagination */}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
              <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <p className="text-xl font-semibold mb-2">Non hai ancora pubblicato nessun progetto.</p>
              <p className="text-muted-foreground mb-6">Inizia ora per trovare i talenti BIM di cui hai bisogno.</p>
              <Button size="lg" asChild>
                <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}><PlusCircle className="mr-2 h-5 w-5" /> Pubblica il Tuo Primo Progetto</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
