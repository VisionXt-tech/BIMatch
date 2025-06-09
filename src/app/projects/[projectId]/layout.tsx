
import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase'; // db can be null if Firebase init fails
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
    const dbStatusMessage = "Firestore 'db' instance is null. This indicates an issue with Firebase app initialization in 'firebase.ts' or missing/incorrect Firebase config in .env.local. Check server logs from 'firebase.ts' for more details.";
    console.error(
      `generateMetadata for project ${String(projectId)}: ${dbStatusMessage}`
    );
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
        console.warn(`generateMetadata: Project with ID ${String(projectId)} not found.`);
      }
    } catch (error: any) {
      console.error(
        `Error fetching project (ID: ${String(projectId)}) for metadata. Message: ${error.message}. ` +
        "This could be a Firestore permissions issue OR an issue with the 'db' instance if it's not fully functional. " +
        "Please check your Firestore security rules and ensure Firebase is correctly configured in .env.local. " +
        `Stack: ${error.stack}`
      );
      projectTitle = 'Errore Caricamento Progetto';
      projectDescription = `Impossibile caricare i dettagli del progetto. Causa: ${error.message}. Controlla i permessi di Firestore e la configurazione Firebase.`;
    }
  } else {
    console.warn(`generateMetadata: Invalid or missing projectId: ${String(projectId)}. Using default metadata.`);
  }

  return {
    title: `${projectTitle} | BIMatch`,
    description: projectDescription,
  };
}

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
