import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] hover:shadow-sm select-none';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 hover:shadow-primary-500/10 shadow-sm border border-primary-600/20',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/40 dark:border-slate-800/40',
    outline: 'border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-500 hover:shadow-red-500/10 shadow-sm border border-red-600/20',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-[10px] tracking-widest',
    md: 'h-10 px-5 text-xs',
    lg: 'h-11 px-8 text-sm tracking-widest',
  };

  return (
    <button
      ref={ref}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
