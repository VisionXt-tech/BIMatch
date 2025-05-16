import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';

// Define the props for the page and layout, including params
type Props = {
  params: { id: string };
  children: ReactNode; // Children prop for layout
};

// This function runs on the server to generate metadata for dynamic routes.
// It's crucial to access params properties directly (e.g., params.id)
// and not enumerate or spread the entire params object.
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata // Optional: access metadata from parent segments
): Promise<Metadata> {
  // Access params.id directly.
  const id = params.id;

  // In a real application, you might fetch data based on the id
  // to set a more descriptive title, e.g., the professional's name.
  // For example:
  // const professional = await getProfessionalData(id); // Your data fetching function
  // const title = professional ? `${professional.displayName} | Profilo BIMatch` : 'Profilo Professionista | BIMatch';

  // For now, we'll use a generic title structure incorporating the ID.
  const pageTitle = `Profilo Professionista ${id} | BIMatch`;
  const pageDescription = `Visualizza il profilo completo del professionista BIM con ID ${id} su BIMatch, la piattaforma per talenti e aziende del settore.`;

  // Optionally, inherit and extend Open Graph images from parent
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: pageTitle,
    description: pageDescription,
    // openGraph: {
    //   title: pageTitle,
    //   description: pageDescription,
    //   // images: ['/some-specific-og-image.png', ...previousImages], // Example for OG images
    // },
  };
}

// This layout component will wrap the src/app/professionals/[id]/page.tsx
// It's primarily here to host the generateMetadata function for this dynamic segment.
export default function ProfessionalProfileSegmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>; // The layout simply renders its children
}
