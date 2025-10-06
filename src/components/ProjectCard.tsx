'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Calendar, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ROUTES, BIM_SKILLS_OPTIONS } from '@/constants';
import type { Project } from '@/types/project';
import { Timestamp } from 'firebase/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import type { ProjectStatus } from '@/components/StatusBadge';

interface ProjectCardProps {
  project: Project;
  showActions?: boolean;
  actionButton?: React.ReactNode;
  className?: string;
}

const getSkillLabel = (value: string) => BIM_SKILLS_OPTIONS.find(s => s.value === value)?.label || value;

/**
 * ProjectCard Component
 * Modern card design with hero image, inspired by food delivery apps
 *
 * Features:
 * - Hero image with fallback gradient
 * - Company logo overlay badge
 * - Prominent title and description
 * - Metadata icons (location, duration, budget)
 * - Skill tags at bottom
 * - Customizable action button
 */
export function ProjectCard({ project, showActions = true, actionButton, className = '' }: ProjectCardProps) {
  const hasImage = !!project.projectImage;
  const skillsPreview = project.requiredSkills?.slice(0, 3) || [];
  const remainingSkills = (project.requiredSkills?.length || 0) - skillsPreview.length;

  return (
    <Card className={`overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 flex flex-col h-full ${className}`}>
      {/* Hero Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
        {hasImage ? (
          <img
            src={project.projectImage}
            alt={project.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          /* Fallback gradient con pattern */
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-accent/30 flex items-center justify-center">
            <Briefcase className="h-16 w-16 text-primary/30" />
          </div>
        )}

        {/* Company Logo Badge Overlay */}
        {project.companyLogo && (
          <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-lg">
            <img
              src={project.companyLogo}
              alt={project.companyName}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge
            status={project.status as ProjectStatus}
            type="project"
            showIcon
            size="sm"
          />
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3 flex-grow">
        {/* Company Name */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span className="font-medium">{project.companyName}</span>
        </div>

        {/* Title */}
        <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
          <h3 className="text-lg font-bold leading-tight hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{project.location}</span>
          </div>
          {project.duration && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{project.duration}</span>
            </div>
          )}
          {project.budgetRange && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{project.budgetRange}</span>
            </div>
          )}
        </div>

        {/* Skills Tags */}
        {skillsPreview.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {skillsPreview.map(skillKey => (
              <Badge
                key={skillKey}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-muted hover:bg-muted/80"
              >
                {getSkillLabel(skillKey)}
              </Badge>
            ))}
            {remainingSkills > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{remainingSkills}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer Actions */}
      {showActions && (
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {project.postedAt && (project.postedAt as Timestamp).toDate
              ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'short'
                })
              : 'N/A'}
          </span>
          {actionButton || (
            <Button size="sm" asChild variant="default">
              <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Dettagli
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
