
import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase'; // Assuming db is exported from a central firebase setup
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

  // Defensive check for db instance.
  // Firestore instances have an INTERNAL property; this is a basic check.
  // A more robust check might be `db && db.constructor && db.constructor.name === 'Firestore'`,
  // but this simple check can help identify totally uninitialized db objects.
  if (!db || !('INTERNAL' in db)) { 
    console.error(`generateMetadata for project ${projectId}: Firestore 'db' instance appears to be invalid or not initialized. Using default metadata. Check Firebase configuration.`);
    return {
      title: `${projectTitle} (Errore Config) | BIMatch`,
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
