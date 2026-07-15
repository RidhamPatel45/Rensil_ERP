import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={twMerge(clsx(
        "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400/80 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all disabled:cursor-not-allowed disabled:opacity-50 duration-200",
        className
      ))}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Label = React.forwardRef(({ className, children, ...props }, ref) => (
  <label
    ref={ref}
    className={twMerge(clsx("text-sm text-slate-700 dark:text-slate-300 font-medium mb-1 block", className))}
    {...props}
  >
    {children}
  </label>
));
Label.displayName = 'Label';
