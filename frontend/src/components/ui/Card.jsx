import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="p-1 bg-slate-500/[0.03] dark:bg-slate-100/[0.015] border border-slate-200/50 dark:border-slate-800/30 rounded-[1.25rem] shadow-sm"
    >
      <div
        className={twMerge(clsx("bg-white dark:bg-slate-900/40 rounded-[calc(1.25rem-0.25rem)] border border-slate-100/80 dark:border-slate-800/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] h-full", className))}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={twMerge(clsx("px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/60", className))} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={twMerge(clsx("text-base font-bold tracking-tight text-slate-800 dark:text-slate-100", className))} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={twMerge(clsx("p-6", className))} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';
