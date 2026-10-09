import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string;
  error?: string;
}

export function RadioGroup({
  name,
  options,
  selectedValue,
  onChange,
  className,
  label,
  error,
}: RadioGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </span>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isChecked = selectedValue === option.value;
          return (
            <div
              key={option.value}
              className={cn(
                "flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                isChecked
                  ? "border-primary bg-red-50/40 text-slate-900"
                  : "border-input hover:bg-slate-50",
                option.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if (!option.disabled && onChange) {
                  onChange(option.value);
                }
              }}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={isChecked}
                disabled={option.disabled}
                onChange={() => onChange && onChange(option.value)}
                className="mt-0.5 h-4 w-4 text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="grid gap-0.5 select-none">
                <label
                  htmlFor={optionId}
                  className="text-sm font-medium text-slate-900 cursor-pointer"
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}
