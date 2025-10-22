
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Project } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function AdminProjectsPage() {
  const { db } = useFirebase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    if (!db) return;

    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('postedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedProjects: Project[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const getStatusBadgeVariant = (status: Project['status']) => {
    switch (status) {
      case 'attivo': return 'default';
      case 'chiuso': return 'destructive';
      default: return 'secondary';
    }
  };


  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/4" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/3" /></TableCell>
        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="space-y-4 w-full min-w-0 max-w-7xl mx-auto px-4 py-4">
      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardContent className="p-4 sm:p-8">
          <div className="flex items-center gap-4 min-w-0">
            <Briefcase className="h-6 w-6 text-[#008080] shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900">Gestione Progetti</h1>
              <p className="text-sm text-gray-600 truncate">Visualizza e gestisci tutti i progetti pubblicati sulla piattaforma.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardContent className="p-4 sm:p-8">
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : projects.map((project) => (
              <Card key={project.id} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-gray-900 flex-1 min-w-0 break-words leading-tight">
                          {project.title}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(project.status)} className="capitalize text-xs shrink-0 whitespace-nowrap">
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 break-words leading-tight">{project.companyName}</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {project.postedAt && (project.postedAt as Timestamp).toDate
                          ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT')
                          : 'N/D'}
                      </span>
                      <Button asChild variant="outline" size="sm" className="min-h-[44px] text-sm w-full">
                        <Link href={ROUTES.PROJECT_DETAILS(project.id!)} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Vedi Progetto
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo Progetto</TableHead>
                  <TableHead>Azienda</TableHead>
                  <TableHead>Data Pubblicazione</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderSkeleton() : projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium text-sm">{project.title}</TableCell>
                    <TableCell className="text-sm">{project.companyName}</TableCell>
                    <TableCell className="text-sm">
                      {project.postedAt && (project.postedAt as Timestamp).toDate
                        ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT')
                        : 'N/D'}
                    </TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(project.status)} className="capitalize text-sm">{project.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="text-sm">
                        <Link href={ROUTES.PROJECT_DETAILS(project.id!)} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Vedi Progetto
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
