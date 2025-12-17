import React from 'react';
import { cn } from '../../lib/utils';

export interface KidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string; // Label above input (not placeholder)
    error?: string;
}

/**
 * Kid-friendly Input component
 * - Larger inputs (h-12 minimum)
 * - Visible focus rings
 * - Labels above input (not placeholders) for better accessibility
 * - Clear error states
 */
const KidInput = React.forwardRef<HTMLInputElement, KidInputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const inputId = id || `kid-input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-lg font-bold text-slate-900 dark:text-slate-100"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "flex h-12 w-full rounded-xl border-2 bg-white dark:bg-slate-700 px-4 py-3 text-base",
                        "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2",
                        "focus-visible:border-primary-500 transition-all duration-200",
                        "hover:border-primary-400 dark:hover:border-primary-500",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-danger-500 focus-visible:ring-danger-500/50",
                        !error && "border-slate-300 dark:border-slate-600",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-danger-600 dark:text-danger-400" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
KidInput.displayName = "KidInput";

export default KidInput;

