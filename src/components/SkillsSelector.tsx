'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState } from 'react';

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

  const [openItems, setOpenItems] = useState<string[]>(categoriesWithSelection.length > 0 ? categoriesWithSelection : [categories[0]?.id || '']);

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

  const removeSkill = (skillValue: string) => {
    onChange(selectedSkills.filter(v => v !== skillValue));
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-primary mb-1">{label}</h3>
        {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      </div>

      {/* Badge selezionati - sempre visibili in alto */}
      {selectedSkills.length > 0 && (
        <div className="p-3 rounded-md border bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Competenze selezionate ({selectedSkills.length})
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-primary hover:underline"
            >
              Deseleziona tutto
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSkills.map(skillValue => {
              const skill = categories
                .flatMap(c => c.skills)
                .find(s => s.value === skillValue);
              return skill ? (
                <Badge
                  key={skillValue}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeSkill(skillValue)}
                >
                  {skill.label} ✕
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Accordion categorie in griglia responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {categories.map(category => {
          const selectedCount = getSelectedSkillsInCategory(category.id);

          return (
            <Accordion
              key={category.id}
              type="single"
              collapsible
              defaultValue={openItems.includes(category.id) ? category.id : undefined}
              className="w-full"
            >
              <AccordionItem
                value={category.id}
                className="border rounded-md bg-card"
              >
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/50 rounded-t-md">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="text-sm font-medium">{category.title}</span>
                    {selectedCount > 0 && (
                      <Badge variant="default" className="text-xs ml-2">
                        {selectedCount}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-2.5 pt-1.5">
                  <div className="grid grid-cols-1 gap-y-2">
                    {category.skills.map(skill => (
                      <div key={skill.value} className="flex items-start space-x-2">
                        <Checkbox
                          id={`skill-${skill.value}`}
                          checked={selectedSkills.includes(skill.value)}
                          onCheckedChange={(checked) => handleSkillToggle(skill.value, !!checked)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <Label
                          htmlFor={`skill-${skill.value}`}
                          className="font-normal text-xs leading-tight cursor-pointer flex-1"
                        >
                          {skill.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
}
