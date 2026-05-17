import * as React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95',
      secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95',
      outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
      ghost: 'text-slate-400 hover:bg-slate-800 hover:text-white',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium',
      md: 'px-4 py-2 text-sm font-semibold',
      lg: 'px-6 py-3 text-base font-semibold',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
