import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const Select = ({
  value,
  onValueChange,
  children,
  className,
  onChange,
  ...props
}: SelectProps) => {
  return (
    <select
      value={value}
      onChange={(event) => {
        onValueChange?.(event.target.value);
        onChange?.(event);
      }}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export const SelectTrigger = ({ children, className: _className }: SelectTriggerProps) => (
  <>{children}</>
);
export const SelectValue = ({ placeholder }: SelectValueProps) =>
  placeholder ? (
    <option value="" disabled>
      {placeholder}
    </option>
  ) : null;
export const SelectContent = ({ children }: SelectContentProps) => <>{children}</>;
export const SelectItem = ({ value, children }: SelectItemProps) => (
  <option value={value}>{children}</option>
);
