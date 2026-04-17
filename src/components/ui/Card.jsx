import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge(clsx("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm", className))}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={twMerge(clsx("px-6 py-4 border-b border-slate-100 dark:border-slate-800", className))} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={twMerge(clsx("text-lg font-semibold text-slate-800 dark:text-slate-100", className))} {...props}>
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
