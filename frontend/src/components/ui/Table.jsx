import React from 'react';
import clsx from 'clsx';

export const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className={clsx("w-full caption-bottom text-sm dark:text-slate-300", className)} {...props} />
  </div>
);

export const TableHeader = ({ className, ...props }) => (
  <thead className={clsx("[&_tr]:border-b dark:[&_tr]:border-slate-800", className)} {...props} />
);

export const TableBody = ({ className, ...props }) => (
  <tbody className={clsx("[&_tr:last-child]:border-0", className)} {...props} />
);

export const TableFooter = ({ className, ...props }) => (
  <tfoot
    className={clsx("border-t bg-slate-100/50 dark:bg-slate-900/50 font-medium [&>tr]:last:border-b-0 dark:border-slate-800", className)}
    {...props}
  />
);

export const TableRow = ({ className, ...props }) => (
  <tr
    className={clsx(
      "border-b transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900/50 data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-slate-800 dark:border-slate-800",
      className
    )}
    {...props}
  />
);

export const TableHead = ({ className, ...props }) => (
  <th
    className={clsx(
      "h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }) => (
  <td
    className={clsx("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
);

export const TableCaption = ({ className, ...props }) => (
  <caption
    className={clsx("mt-4 text-sm text-slate-500", className)}
    {...props}
  />
);
