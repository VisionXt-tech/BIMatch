import { useMemo } from 'react';
import type { ProfessionalProfile } from '@/types/auth';

export interface ProfileStrengthResult {
  totalStrength: number; // 0-100
  breakdown: {
    baseInfo: number;
    skills: number;
    experience: number;
    certifications: number;
    portfolio: number;
    professional: number;
  };
  level: 'beginner' | 'growing' | 'solid' | 'expert';
  levelLabel: string;
  levelEmoji: string;
  powerPoints: number;
  nextMilestone: {
    target: number;
    label: string;
    missing: number;
    suggestions: string[];
  } | null;
}

const STRENGTH_WEIGHTS = {
  baseInfo: 20,        // Nome, cognome, location, bio
  skills: 25,          // BIM skills + Software
  experience: 15,      // Experience level, availability
  certifications: 20,  // CV + certificazioni
  portfolio: 10,       // Portfolio URL o LinkedIn
  professional: 10     // Monthly rate, bio completa
};

const SKILL_POWER_WEIGHTS = {
  bimSkill: 3,
  software: 2,
  cv: 5,
  albo: 10,
  uni: 15,
  other: 8,
  portfolio: 5,
  linkedIn: 5,
  monthlyRate: 3,
};

export function useProfileStrength(profile: ProfessionalProfile | null): ProfileStrengthResult {
  return useMemo(() => {
    if (!profile) {
      return {
        totalStrength: 0,
        breakdown: {
          baseInfo: 0,
          skills: 0,
          experience: 0,
          certifications: 0,
          portfolio: 0,
          professional: 0,
        },
        level: 'beginner',
        levelLabel: 'Profilo Iniziale',
        levelEmoji: '⚪',
        powerPoints: 0,
        nextMilestone: {
          target: 25,
          label: 'Profilo in Crescita',
          missing: 25,
          suggestions: ['Completa nome e cognome', 'Aggiungi una bio', 'Seleziona la tua regione'],
        },
      };
    }

    // Calculate each section
    let baseInfo = 0;
    if (profile.firstName && profile.firstName.length >= 2) baseInfo += 5;
    if (profile.lastName && profile.lastName.length >= 2) baseInfo += 5;
    if (profile.location && profile.location.length >= 2) baseInfo += 5;
    if (profile.bio && profile.bio.length >= 50) baseInfo += 5;

    let skills = 0;
    const bimSkillsCount = profile.bimSkills?.length || 0;
    const softwareCount = profile.softwareProficiency?.length || 0;
    if (bimSkillsCount >= 1) skills += 5;
    if (bimSkillsCount >= 3) skills += 5;
    if (bimSkillsCount >= 5) skills += 5;
    if (softwareCount >= 1) skills += 3;
    if (softwareCount >= 2) skills += 4;
    if (softwareCount >= 4) skills += 3;

    let experience = 0;
    if (profile.experienceLevel && profile.experienceLevel.length > 0) experience += 5;
    if (profile.workMode && profile.workMode.length > 0) experience += 3;
    if (profile.availability && profile.availability.length > 0) experience += 4;
    if (profile.locationMode && profile.locationMode.length > 0) experience += 3;

    let certifications = 0;
    if (profile.cvUrl && profile.cvUrl.length > 0) certifications += 8;
    if (profile.alboRegistrationUrl || profile.alboSelfCertified) certifications += 4;
    if (profile.uniCertificationUrl || profile.uniSelfCertified) certifications += 5;
    if (profile.otherCertificationsUrl || profile.otherCertificationsSelfCertified) certifications += 3;

    let portfolio = 0;
    // Portfolio URL removed - no points from this section anymore

    let professional = 0;
    const monthlyRateValue = typeof profile.monthlyRate === 'string' ? profile.monthlyRate : String(profile.monthlyRate || '');
    if (monthlyRateValue && monthlyRateValue.length > 0 && monthlyRateValue !== 'undefined' && monthlyRateValue !== 'null') {
      professional += 5;
    }
    if (profile.bio && profile.bio.length >= 100) professional += 5;

    const totalStrength = Math.min(100, baseInfo + skills + experience + certifications + portfolio + professional);

    // Calculate level
    let level: 'beginner' | 'growing' | 'solid' | 'expert' = 'beginner';
    let levelLabel = 'Profilo Iniziale';
    let levelEmoji = '⚪';

    if (totalStrength >= 76) {
      level = 'expert';
      levelLabel = 'Profilo Expert';
      levelEmoji = '🏆';
    } else if (totalStrength >= 51) {
      level = 'solid';
      levelLabel = 'Profilo Solido';
      levelEmoji = '⭐';
    } else if (totalStrength >= 26) {
      level = 'growing';
      levelLabel = 'Profilo in Crescita';
      levelEmoji = '🌱';
    }

    // Calculate power points
    let powerPoints = 0;
    powerPoints += (profile.bimSkills?.length || 0) * SKILL_POWER_WEIGHTS.bimSkill;
    powerPoints += (profile.softwareProficiency?.length || 0) * SKILL_POWER_WEIGHTS.software;
    // cvUrl removed from power points (was part of certification upload)
    if (profile.alboRegistrationUrl || profile.alboSelfCertified) powerPoints += SKILL_POWER_WEIGHTS.albo;
    if (profile.uniCertificationUrl || profile.uniSelfCertified) powerPoints += SKILL_POWER_WEIGHTS.uni;
    if (profile.otherCertificationsUrl || profile.otherCertificationsSelfCertified) powerPoints += SKILL_POWER_WEIGHTS.other;
    // portfolioUrl removed from power points
    if (monthlyRateValue && monthlyRateValue.length > 0 && monthlyRateValue !== 'undefined' && monthlyRateValue !== 'null') {
      powerPoints += SKILL_POWER_WEIGHTS.monthlyRate;
    }

    // Calculate next milestone
    let nextMilestone: ProfileStrengthResult['nextMilestone'] = null;
    const suggestions: string[] = [];

    if (totalStrength < 100) {
      let target = 26;
      let label = 'Profilo in Crescita';

      if (totalStrength >= 76) {
        target = 100;
        label = 'Profilo Completo';
      } else if (totalStrength >= 51) {
        target = 76;
        label = 'Profilo Expert';
      } else if (totalStrength >= 26) {
        target = 51;
        label = 'Profilo Solido';
      }

      // Generate suggestions based on what's missing
      if (baseInfo < STRENGTH_WEIGHTS.baseInfo) {
        if (!profile.firstName || profile.firstName.length < 2) suggestions.push('Completa il nome');
        if (!profile.lastName || profile.lastName.length < 2) suggestions.push('Completa il cognome');
        if (!profile.location) suggestions.push('Aggiungi la tua regione');
        if (!profile.bio || profile.bio.length < 50) suggestions.push('Scrivi una bio (min 50 caratteri)');
      }

      if (skills < STRENGTH_WEIGHTS.skills) {
        const bimCount = profile.bimSkills?.length || 0;
        const swCount = profile.softwareProficiency?.length || 0;
        if (bimCount < 5) suggestions.push(`Aggiungi ${5 - bimCount} competenze BIM`);
        if (swCount < 4) suggestions.push(`Aggiungi ${4 - swCount} software`);
      }

      if (experience < STRENGTH_WEIGHTS.experience) {
        if (!profile.experienceLevel) suggestions.push('Seleziona il livello di esperienza (+5pts)');
        if (!profile.workMode) suggestions.push('Indica la modalità lavorativa (+3pts)');
        if (!profile.availability) suggestions.push('Indica la disponibilità temporale (+4pts)');
        if (!profile.locationMode) suggestions.push('Seleziona preferenza sede di lavoro (+3pts)');
      }

      if (certifications < STRENGTH_WEIGHTS.certifications) {
        if (!profile.alboRegistrationUrl && !profile.alboSelfCertified) suggestions.push('Aggiungi iscrizione Albo (+4pts)');
        if (!profile.uniCertificationUrl && !profile.uniSelfCertified) suggestions.push('Aggiungi certificazione UNI 11337 (+5pts)');
        if (!profile.otherCertificationsUrl && !profile.otherCertificationsSelfCertified) suggestions.push('Aggiungi altre certificazioni (+3pts)');
      }

      if (professional < STRENGTH_WEIGHTS.professional) {
        if (!profile.monthlyRate) suggestions.push('Indica la retribuzione mensile');
        if (!profile.bio || profile.bio.length < 100) suggestions.push('Espandi la bio a 100+ caratteri');
      }

      nextMilestone = {
        target,
        label,
        missing: target - totalStrength,
        suggestions: suggestions.slice(0, 3), // Top 3 suggestions
      };
    }

    return {
      totalStrength,
      breakdown: {
        baseInfo,
        skills,
        experience,
        certifications,
        portfolio,
        professional,
      },
      level,
      levelLabel,
      levelEmoji,
      powerPoints,
      nextMilestone,
    };
  }, [profile]);
}
