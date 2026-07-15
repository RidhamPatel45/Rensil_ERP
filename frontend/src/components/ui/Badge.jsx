import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    outline: 'border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400',
  };

  return (
    <span
      className={twMerge(clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      ))}
      {...props}
    >
      {children}
    </span>
  );
};
