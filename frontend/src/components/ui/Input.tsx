import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60',
              'transition-[border-color,box-shadow,background-color] duration-150 ease-out outline-none',
              'focus:ring-2 focus:ring-primary/15 focus:border-primary focus:bg-surface-warm',
              error
                ? 'border-error focus:ring-error/20 focus:border-error'
                : 'border-border hover:border-sand-300',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error flex items-center gap-1 mt-0.5">{error}</p>}
        {hint && !error && <p className="text-xs text-text-secondary mt-0.5">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
