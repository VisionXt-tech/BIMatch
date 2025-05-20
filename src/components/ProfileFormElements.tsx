'use client';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FormInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: React.HTMLInputTypeAttribute;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = 'text',
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          <FormControl>
            <Input 
              type={type} 
              placeholder={placeholder} 
              {...field} 
              value={field.value === null || field.value === undefined ? '' : field.value} 
              className="h-9"
            />
          </FormControl>
          {description && <FormDescription className="text-xs">{description}</FormDescription>}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

interface FormTextareaProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  rows?: number;
}

export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  rows = 3,
}: FormTextareaProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          <FormControl>
            <Textarea 
              placeholder={placeholder} 
              rows={rows} 
              {...field}
              value={field.value === null || field.value === undefined ? '' : field.value} 
            />
          </FormControl>
          {description && <FormDescription className="text-xs">{description}</FormDescription>}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

interface FormMultiSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: { value: string; label: string }[];
  description?: string;
  placeholder?: string;
}

export function FormMultiSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  description,
  placeholder = "Seleziona opzioni..."
}: FormMultiSelectProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{placeholder}</p>
              <ScrollArea className="h-40 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${String(name)}-${option.value}`}
                      checked={field.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValue = Array.isArray(field.value) ? field.value : [];
                        if (checked) {
                          field.onChange([...currentValue, option.value]);
                        } else {
                          field.onChange(currentValue.filter((v: string) => v !== option.value));
                        }
                      }}
                    />
                    <Label htmlFor={`${String(name)}-${option.value}`} className="font-normal text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
                </div>
              </ScrollArea>
               <div className="flex flex-wrap gap-1 mt-1">
                {(Array.isArray(field.value) ? field.value : []).map((val) => {
                  const currentOption = options.find(opt => opt.value === val);
                  return currentOption ? <Badge key={val} variant="secondary">{currentOption.label}</Badge> : null;
                })}
              </div>
            </div>
          </FormControl>
          {description && <FormDescription className="text-xs">{description}</FormDescription>}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}


interface FormSingleSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
}

export function FormSingleSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Seleziona un'opzione",
  description,
}: FormSingleSelectProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ''} // Ensure value is controlled, fallback to empty string if null/undefined
          >
            <FormControl>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription className="text-xs">{description}</FormDescription>}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
