
import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';
import { BIM_SKILLS_OPTIONS, ITALIAN_REGIONS } from '@/constants'; // Assuming these might be used for labels

// Helper to get label for a filter value
const getLabel = (options: { value: string; label: string }[], value?: string): string | undefined => {
  if (!value) return undefined;
  return options.find(opt => opt.value === value)?.label || value;
};

type Props = {
  // params is part of the standard signature but might not be used for a top-level page like /professionals
  searchParams: { [key: string]: string | string[] | undefined };
  children: ReactNode;
};

export async function generateMetadata(
  { searchParams }: Omit<Props, 'children' | 'params'>, // Omit params if not used for this route
  parent: ResolvingMetadata
): Promise<Metadata> {
  let title = "Marketplace Professionisti BIM | BIMatch";
  let description = "Trova professionisti BIM qualificati, manager BIM, e specialisti in Italia su BIMatch. Filtra per competenze, località, e livello di esperienza.";

  // Access properties directly: searchParams.skill, searchParams.location etc.
  const skillFilterValue = typeof searchParams.skill === 'string' ? searchParams.skill : undefined;
  const locationFilterValue = typeof searchParams.location === 'string' ? searchParams.location : undefined;
  const experienceFilterValue = typeof searchParams.experience === 'string' ? searchParams.experience : undefined;

  const skillLabel = getLabel(BIM_SKILLS_OPTIONS, skillFilterValue);
  const locationLabel = locationFilterValue; // Italian regions are directly usable as labels

  if (skillLabel && locationLabel) {
    title = `Professionisti BIM: ${skillLabel} in ${locationLabel} | BIMatch`;
    description = `Sfoglia i professionisti BIM specializzati in ${skillLabel} e localizzati in ${locationLabel}. Trova il tuo prossimo esperto BIM su BIMatch.`;
  } else if (skillLabel) {
    title = `Professionisti BIM esperti in ${skillLabel} | BIMatch`;
    description = `Scopri esperti BIM con competenze in ${skillLabel}. Connettiti con i migliori talenti per i tuoi progetti su BIMatch.`;
  } else if (locationLabel) {
    title = `Professionisti BIM in ${locationLabel} | BIMatch`;
    description = `Trova professionisti BIM locali in ${locationLabel}. Esplora profili e connettiti con esperti vicino a te su BIMatch.`;
  } else if (experienceFilterValue) {
     // You might want to fetch a label for experience level if it's more complex
    title = `Professionisti BIM con esperienza ${experienceFilterValue} | BIMatch`;
    description = `Cerca professionisti BIM con livello di esperienza ${experienceFilterValue} su BIMatch.`;
  }

  // IMPORTANT: Avoid logging the raw searchParams object directly.
  // If logging is needed for debugging, log specific, extracted properties:
  // console.log(`Generating metadata for professionals marketplace. Skill: ${skillFilterValue}, Location: ${locationFilterValue}`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // You could add a specific image for the professionals marketplace here
      // images: ['/og-professionals-marketplace.png'], 
    },
  };
}

export default function ProfessionalsMarketplaceLayout({ children }: { children: ReactNode }) {
  // This layout simply passes through its children.
  // Its primary purpose here is to host the generateMetadata function for the /professionals route.
  return <>{children}</>;
}
