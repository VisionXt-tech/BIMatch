
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Gestione Progetti</CardTitle>
              <CardDescription>Visualizza e gestisci tutti i progetti pubblicati sulla piattaforma.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.companyName}</TableCell>
                  <TableCell>
                    {project.postedAt && (project.postedAt as Timestamp).toDate
                      ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT')
                      : 'N/D'}
                  </TableCell>
                  <TableCell>
                     <Badge variant={getStatusBadgeVariant(project.status)} className="capitalize">{project.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={ROUTES.PROJECT_DETAILS(project.id!)} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-1" /> Vedi Progetto
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
