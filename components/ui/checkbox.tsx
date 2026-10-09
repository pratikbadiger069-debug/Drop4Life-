import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="flex items-start space-x-2.5">
        <input
          id={inputId}
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 mt-0.5 rounded border-input text-primary focus:ring-primary focus:ring-offset-2 transition-colors cursor-pointer accent-primary",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="grid gap-0.5 leading-none select-none">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-slate-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
