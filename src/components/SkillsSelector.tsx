'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Box,
  Users,
  LineChart,
  Calendar,
  Monitor,
  Sparkles,
  Building2,
  Award,
  Pencil,
  GitMerge,
  Calculator,
  Bot,
  Camera,
  Thermometer,
  Building,
  ScanLine,
  Map,
  Cloud,
  Ruler,
  LucideIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

// Mappa delle icone
const iconMap: Record<string, LucideIcon> = {
  Box,
  Users,
  LineChart,
  Calendar,
  Monitor,
  Sparkles,
  Building2,
  Award,
  Pencil,
  GitMerge,
  Calculator,
  Bot,
  Camera,
  Thermometer,
  Building,
  ScanLine,
  Map,
  Cloud,
  Ruler,
};

interface SkillCategory {
  id: string;
  title: string;
  icon?: string;
  skills: { value: string; label: string }[];
}

interface SkillsSelectorProps {
  categories: SkillCategory[];
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  label: string;
  description?: string;
}

export function SkillsSelector({ categories, selectedSkills, onChange, label, description }: SkillsSelectorProps) {
  // Trova le categorie con almeno una skill selezionata per aprirle di default
  const categoriesWithSelection = categories
    .filter(cat => cat.skills.some(skill => selectedSkills.includes(skill.value)))
    .map(cat => cat.id);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categoriesWithSelection.length > 0 ? categoriesWithSelection : [categories[0]?.id || ''])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleSkillToggle = (skillValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedSkills, skillValue]);
    } else {
      onChange(selectedSkills.filter(v => v !== skillValue));
    }
  };

  const getSelectedSkillsInCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 0;
    return category.skills.filter(skill => selectedSkills.includes(skill.value)).length;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const removeSkill = (skillValue: string) => {
    onChange(selectedSkills.filter(v => v !== skillValue));
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categories.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Filtra le categorie e le competenze in base alla ricerca
  const filteredCategories = categories.map(category => ({
    ...category,
    skills: category.skills.filter(skill =>
      skill.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.skills.length > 0);

  // Calcola il totale delle competenze
  const totalSkills = categories.reduce((sum, cat) => sum + cat.skills.length, 0);
  const selectionPercentage = totalSkills > 0 ? (selectedSkills.length / totalSkills) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header con titolo e descrizione */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {selectedSkills.length} / {totalSkills}
            </span>
          </div>
        </div>
        {description && <p className="text-sm text-gray-600">{description}</p>}

        {/* Barra di progresso */}
        <div className="space-y-2">
          <Progress value={selectionPercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            Hai selezionato {selectedSkills.length} competenze ({Math.round(selectionPercentage)}% del totale)
          </p>
        </div>
      </div>

      {/* Barra di ricerca e azioni */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Cerca competenze..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Espandi tutto
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Riduci tutto
          </button>
        </div>
      </div>

      {/* Badge selezionati - sempre visibili */}
      {selectedSkills.length > 0 && (
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#008080]" />
              <span className="text-sm font-semibold text-gray-900">
                Competenze Selezionate ({selectedSkills.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Deseleziona tutto
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skillValue => {
              const skill = categories
                .flatMap(c => c.skills)
                .find(s => s.value === skillValue);
              return skill ? (
                <Badge
                  key={skillValue}
                  variant="secondary"
                  className="text-sm px-3 py-1.5 cursor-pointer hover:bg-gray-300 transition-all duration-200 bg-white border border-gray-200"
                  onClick={() => removeSkill(skillValue)}
                >
                  {skill.label}
                  <X className="ml-2 h-3.5 w-3.5" />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Griglia di categorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCategories.map(category => {
          const selectedCount = getSelectedSkillsInCategory(category.id);
          const totalInCategory = category.skills.length;
          const isExpanded = expandedCategories.has(category.id);
          const categoryProgress = totalInCategory > 0 ? (selectedCount / totalInCategory) * 100 : 0;
          const IconComponent = category.icon ? iconMap[category.icon] : null;

          return (
            <div
              key={category.id}
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                selectedCount > 0
                  ? 'border-[#008080] bg-[#008080]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Header della categoria */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {IconComponent && (
                    <div className={`p-2 rounded-lg ${selectedCount > 0 ? 'bg-[#008080] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900 text-left">
                      {category.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedCount} di {totalInCategory} selezionate
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <Badge
                      variant="default"
                      className="bg-[#008080] text-white text-xs px-2 py-0.5 font-medium"
                    >
                      {selectedCount}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Barra di progresso della categoria */}
              {selectedCount > 0 && (
                <div className="px-4 pb-3">
                  <Progress value={categoryProgress} className="h-1.5" />
                </div>
              )}

              {/* Lista competenze espandibile */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  {category.skills.map(skill => {
                    const isSelected = selectedSkills.includes(skill.value);
                    return (
                      <div
                        key={skill.value}
                        onClick={() => handleSkillToggle(skill.value, !isSelected)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#008080]/10 border border-[#008080]/20'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <Checkbox
                          id={`skill-${skill.value}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSkillToggle(skill.value, !!checked)}
                          className="flex-shrink-0"
                        />
                        <Label
                          htmlFor={`skill-${skill.value}`}
                          className={`text-sm leading-snug cursor-pointer flex-1 ${
                            isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {skill.label}
                        </Label>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-[#008080] flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Messaggio se nessun risultato */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Nessuna competenza trovata per "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-sm text-[#008080] hover:underline"
          >
            Cancella ricerca
          </button>
        </div>
      )}
    </div>
  );
}
