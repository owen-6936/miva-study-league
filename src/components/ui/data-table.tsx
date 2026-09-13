import * as React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  className?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  className,
  onRowClick,
  emptyMessage = 'No data available.',
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key?: keyof T | string, sortable?: boolean) => {
    if (!key || !sortable) return;

    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      if (aVal < bVal) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div
      className={cn('w-full overflow-x-auto rounded-xl border border-border bg-bg-card', className)}
    >
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-text/70 uppercase bg-surface border-b border-border">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className={cn(
                  'px-6 py-4 font-semibold tracking-wider',
                  col.sortable && 'cursor-pointer hover:text-text select-none',
                )}
                onClick={() => handleSort(col.accessorKey, col.sortable)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span className="text-text/40">
                      {sortConfig?.key === col.accessorKey ? (
                        sortConfig?.direction === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-text/50">
                <div className="flex flex-col items-center justify-center">
                  <Inbox className="w-10 h-10 mb-3 opacity-20" />
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((item, i) => (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-text">
                    {col.cell
                      ? col.cell(item)
                      : col.accessorKey
                        ? String(item[col.accessorKey as keyof T])
                        : null}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
