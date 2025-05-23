
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

  if (projectId && db) {
    try {
      const projectDocRef = doc(db, 'projects', projectId);
      const projectDocSnap = await getDoc(projectDocRef);
      if (projectDocSnap.exists()) {
        const projectData = projectDocSnap.data() as Project;
        projectTitle = projectData.title || projectTitle;
        projectDescription = projectData.description ? projectData.description.substring(0, 160) + '...' : projectDescription;
      }
    } catch (error) {
      console.error("Error fetching project for metadata:", error);
    }
  }

  return {
    title: `${projectTitle} | BIMatch`,
    description: projectDescription,
  };
}

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
