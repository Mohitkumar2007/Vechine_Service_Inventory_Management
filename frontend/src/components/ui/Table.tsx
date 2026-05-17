import * as React from "react";
import { cn } from "../../lib/utils";

const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="relative w-full overflow-x-auto">
    <table className={cn("w-full min-w-[720px] caption-bottom text-sm", className)} {...props} />
  </div>
);

const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("[&_tr]:border-b border-slate-800", className)} {...props} />
);

const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      "border-b border-slate-800 transition-colors hover:bg-slate-800/50 data-[state=selected]:bg-slate-800",
      className
    )}
    {...props}
  />
);

const TableHead = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "h-11 px-3 sm:px-4 text-left align-middle font-medium text-slate-400 whitespace-nowrap [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
);

const TableCell = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("p-3 sm:p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
