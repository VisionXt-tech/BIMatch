import type { ProfessionalMarketplaceProfile } from '@/types/marketplace';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES, BIM_SKILLS_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, AVAILABILITY_OPTIONS } from '@/constants';
import { MapPin, Briefcase, User, Clock, ShieldCheck, Construction, Code2 } from 'lucide-react';
import Image from 'next/image';

interface ProfessionalCardProps {
  professional: ProfessionalMarketplaceProfile;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'P';
  const names = name.split(' ');
  if (names.length > 1 && names[0] && names[names.length -1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
  const experienceLabel = EXPERIENCE_LEVEL_OPTIONS.find(opt => opt.value === professional.experienceLevel)?.label;
  const availabilityLabel = AVAILABILITY_OPTIONS.find(opt => opt.value === professional.availability)?.label;

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Avatar className="h-16 w-16 border-2 border-primary/50">
          <AvatarImage src={professional.photoURL || `https://picsum.photos/seed/${professional.id}/100/100`} alt={professional.displayName} data-ai-hint="profile person" />
          <AvatarFallback>{getInitials(professional.displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl font-semibold hover:text-primary transition-colors">
            <Link href={ROUTES.PROFESSIONAL_PROFILE_VIEW(professional.id)}>{professional.displayName}</Link>
          </CardTitle>
          {professional.location && (
            <CardDescription className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" /> {professional.location}
            </CardDescription>
          )}
          {professional.tagline && (
            <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{professional.tagline}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3">
        {experienceLabel && (
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">Esperienza:</span>&nbsp;{experienceLabel}
          </div>
        )}
        {availabilityLabel && (
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">Disponibilità:</span>&nbsp;{availabilityLabel}
          </div>
        )}
        {professional.bimSkills && professional.bimSkills.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><Construction className="h-3.5 w-3.5 mr-1.5 text-primary"/>Competenze BIM Principali:</h4>
            <div className="flex flex-wrap gap-1.5">
              {professional.bimSkills.slice(0, 4).map(skillKey => {
                const skill = BIM_SKILLS_OPTIONS.find(s => s.value === skillKey);
                return skill ? (
                  <Badge key={skillKey} variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/30">
                    {skill.label}
                  </Badge>
                ) : null;
              })}
              {professional.bimSkills.length > 4 && <Badge variant="outline" className="text-xs">+{professional.bimSkills.length - 4} altre</Badge>}
            </div>
          </div>
        )}
         {professional.keySoftware && professional.keySoftware.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><Code2 className="h-3.5 w-3.5 mr-1.5 text-primary"/>Software Chiave:</h4>
            <div className="flex flex-wrap gap-1.5">
              {professional.keySoftware.map(swKey => {
                const software = BIM_SKILLS_OPTIONS.find(s => s.value === swKey) || {label: swKey}; // Fallback if not in constants
                return (
                  <Badge key={swKey} variant="outline" className="text-xs px-2 py-0.5">
                    {software.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={ROUTES.PROFESSIONAL_PROFILE_VIEW(professional.id)}>Visualizza Profilo Completo</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfessionalCard;
```