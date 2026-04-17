import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={twMerge(clsx(
        "flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
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
