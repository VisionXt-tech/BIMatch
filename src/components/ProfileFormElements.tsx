
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
          <FormLabel className="text-sm font-semibold text-primary">{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{placeholder}</p>
              <div className="w-full rounded-md border p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                {options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-2">
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
                      className="mt-0.5"
                    />
                    <Label htmlFor={`${String(name)}-${option.value}`} className="font-normal text-xs leading-tight cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
                </div>
              </div>
               <div className="flex flex-wrap gap-1.5 mt-2">
                {(Array.isArray(field.value) ? field.value : []).map((val) => {
                  const currentOption = options.find(opt => opt.value === val);
                  return currentOption ? <Badge key={val} variant="secondary" className="text-xs">{currentOption.label}</Badge> : null;
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
            value={field.value === '' ? undefined : field.value} // Key change here!
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
