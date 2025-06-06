
import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { Project } from '@/types/project';

type Props = {
  params: { projectId: string };
  children: ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const projectId = params.projectId;
  let projectTitle = 'Dettagli Progetto';
  let projectDescription = 'Visualizza i dettagli del progetto e candidati se sei un professionista BIM.';

  if (!db) {
    console.error(`generateMetadata for project ${projectId}: Firestore 'db' instance is null. This indicates an issue with Firebase app initialization in 'firebase.ts'. Check server logs for errors related to Firebase configuration or initialization. Using default metadata.`);
    return {
      title: `${projectTitle} (Errore Config DB) | BIMatch`,
      description: projectDescription,
    };
  }

  if (projectId && typeof projectId === 'string') {
    try {
      const projectDocRef = doc(db, 'projects', projectId);
      const projectDocSnap = await getDoc(projectDocRef);
      if (projectDocSnap.exists()) {
        const projectData = projectDocSnap.data() as Project;
        projectTitle = projectData.title || projectTitle;
        projectDescription = projectData.description ? projectData.description.substring(0, 160) + '...' : projectDescription;
      } else {
        projectTitle = 'Progetto Non Trovato';
        console.warn(`generateMetadata: Project with ID ${projectId} not found.`);
      }
    } catch (error: any) {
      console.error(`Error fetching project (ID: ${projectId}) for metadata. Message: ${error.message}. Stack: ${error.stack}`, error);
      projectTitle = 'Errore Caricamento Progetto';
    }
  } else {
    console.warn(`generateMetadata: Invalid or missing projectId: ${projectId}. Using default metadata.`);
  }

  return {
    title: `${projectTitle} | BIMatch`,
    description: projectDescription,
  };
}

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
