
import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';
import { BIM_SKILLS_OPTIONS, ITALIAN_REGIONS, EXPERIENCE_LEVEL_OPTIONS } from '@/constants';

// Helper to get label for a filter value
const getLabel = (options: { value: string; label: string }[], value?: string): string | undefined => {
  if (!value) return undefined;
  return options.find(opt => opt.value === value)?.label || value;
};

// Define a specific type for the props passed to generateMetadata for this static route
type ProfessionalsLayoutMetadataProps = {
  params: Record<string, never>; // Explicitly state params is an empty object for this static route
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: ProfessionalsLayoutMetadataProps, // `params` is implicitly passed by Next.js but we don't use it here.
                                                    // The type helps signal its expected structure.
  parent: ResolvingMetadata
): Promise<Metadata> {
  let title = "Marketplace Professionisti BIM | BIMatch";
  let description = "Trova professionisti BIM qualificati, manager BIM, e specialisti in Italia su BIMatch. Filtra per competenze, località, e livello di esperienza.";

  const skillQuery = searchParams?.skill;
  const locationQuery = searchParams?.location;
  const experienceQuery = searchParams?.experience;

  const skillFilterValue = typeof skillQuery === 'string' ? skillQuery : undefined;
  const locationFilterValue = typeof locationQuery === 'string' ? locationQuery : undefined;
  const experienceFilterValue = typeof experienceQuery === 'string' ? experienceQuery : undefined;

  const skillLabel = getLabel(BIM_SKILLS_OPTIONS, skillFilterValue);
  const locationLabel = locationFilterValue; 
  const experienceDisplayValue = getLabel(EXPERIENCE_LEVEL_OPTIONS, experienceFilterValue);


  if (skillLabel && locationLabel) {
    title = `Professionisti BIM: ${skillLabel} in ${locationLabel} | BIMatch`;
    description = `Sfoglia i professionisti BIM specializzati in ${skillLabel} e localizzati in ${locationLabel}. Trova il tuo prossimo esperto BIM su BIMatch.`;
  } else if (skillLabel) {
    title = `Professionisti BIM esperti in ${skillLabel} | BIMatch`;
    description = `Scopri esperti BIM con competenze in ${skillLabel}. Connettiti con i migliori talenti per i tuoi progetti su BIMatch.`;
  } else if (locationLabel) {
    title = `Professionisti BIM in ${locationLabel} | BIMatch`;
    description = `Trova professionisti BIM locali in ${locationLabel}. Esplora profili e connettiti con esperti vicino a te su BIMatch.`;
  } else if (experienceDisplayValue) {
    title = `Professionisti BIM con esperienza ${experienceDisplayValue} | BIMatch`;
    description = `Cerca professionisti BIM con livello di esperienza ${experienceDisplayValue} su BIMatch.`;
  }
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // images: ['/og-professionals-marketplace.png'], 
    },
  };
}

export default function ProfessionalsMarketplaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
