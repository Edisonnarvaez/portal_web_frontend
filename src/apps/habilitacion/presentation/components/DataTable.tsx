import React, { useState, useMemo, useCallback } from 'react';
import {
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineViewColumns,
  HiOutlineArrowsUpDown,
} from 'react-icons/hi2';

/* ─── types ─── */
export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number | null | undefined;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string | number;
  /** Number of items per page. Default 10 */
  pageSize?: number;
  /** Available page sizes. Default [5, 10, 20, 50] */
  pageSizeOptions?: number[];
  /** Show column visibility toggle. Default true */
  showColumnToggle?: boolean;
  /** Show pagination. Default true */
  showPagination?: boolean;
  /** Total items (for server-side pagination) */
  totalItems?: number;
  /** Current page (1-based, for server-side) */
  currentPage?: number;
  /** Callback for server-side page change */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Empty state node */
  emptyState?: React.ReactNode;
  /** Optional class for root wrapper */
  className?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Actions column renderer */
  renderActions?: (row: T) => React.ReactNode;
  /** Highlighted row predicate */
  rowHighlight?: (row: T) => string | undefined;
}

type SortDir = 'asc' | 'desc';

/* ─── component ─── */
function DataTableInner<T>(props: DataTableProps<T>) {
  const {
    data,
    columns: columnsProp,
    keyExtractor,
    pageSize: defaultPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
    showColumnToggle = true,
    showPagination = true,
    totalItems,
    currentPage: controlledPage,
    onPageChange,
    emptyState,
    className = '',
    onRowClick,
    renderActions,
    rowHighlight,
  } = props;

  const isServerSide = typeof onPageChange === 'function';

  /* ── visibility ── */
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => {
    const set = new Set<string>();
    columnsProp.forEach(c => {
      if (c.visible === false) set.add(c.key);
    });
    return set;
  });
  const [showColMenu, setShowColMenu] = useState(false);

  const visibleColumns = useMemo(
    () => columnsProp.filter(c => !hiddenCols.has(c.key)),
    [columnsProp, hiddenCols],
  );

  const toggleCol = (key: string) => {
    setHiddenCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /* ── sorting ── */
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || isServerSide) return data;
    const col = columnsProp.find(c => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const aVal = col.accessor ? col.accessor(a) : (a as Record<string, unknown>)[col.key];
      const bVal = col.accessor ? col.accessor(b) : (b as Record<string, unknown>)[col.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'es', { sensitivity: 'base' });
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columnsProp, isServerSide]);

  /* ── pagination ── */
  const [localPage, setLocalPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPageSize);

  const page = isServerSide ? (controlledPage ?? 1) : localPage;
  const total = isServerSide ? (totalItems ?? data.length) : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const pageData = useMemo(() => {
    if (isServerSide) return sortedData;
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage, isServerSide]);

  const goTo = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(totalPages, p));
      if (isServerSide) {
        onPageChange?.(clamped, perPage);
      } else {
        setLocalPage(clamped);
      }
    },
    [totalPages, perPage, isServerSide, onPageChange],
  );

  const changePerPage = (newSize: number) => {
    setPerPage(newSize);
    if (isServerSide) {
      onPageChange?.(1, newSize);
    } else {
      setLocalPage(1);
    }
  };

  /* ── pagination range helper ── */
  const pageRange = useMemo(() => {
    const range: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }, [page, totalPages]);

  /* ── render ── */
  const hasActions = !!renderActions;
  const colCount = visibleColumns.length + (hasActions ? 1 : 0);

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Column toggle */}
      {showColumnToggle && (
        <div className="relative flex justify-end">
          <button
            onClick={() => setShowColMenu(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <HiOutlineViewColumns className="h-4 w-4" />
            Columnas
          </button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 max-h-60 overflow-y-auto">
                {columnsProp.map(col => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenCols.has(col.key)}
                      onChange={() => toggleCol(col.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-gray-600 dark:text-gray-400 ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-200' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <HiOutlineChevronUp className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <HiOutlineChevronDown className="h-3.5 w-3.5 text-blue-600" />
                        )
                      ) : (
                        <HiOutlineArrowsUpDown className="h-3.5 w-3.5 opacity-30" />
                      )
                    )}
                  </span>
                </th>
              ))}
              {hasActions && (
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron registros
                </td>
              </tr>
            ) : (
              pageData.map(row => {
                const highlight = rowHighlight?.(row);
                return (
                  <tr
                    key={keyExtractor(row)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${highlight ?? ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleColumns.map(col => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        } text-gray-700 dark:text-gray-300`}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        {renderActions!(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          {/* Info + page size */}
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <span>
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
            </span>
            <select
              value={perPage}
              onChange={e => changePerPage(Number(e.target.value))}
              className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {pageSizeOptions.map(n => (
                <option key={n} value={n}>
                  {n} / pág
                </option>
              ))}
            </select>
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <PagBtn disabled={page <= 1} onClick={() => goTo(1)} title="Primera">
              <HiOutlineChevronDoubleLeft className="h-4 w-4" />
            </PagBtn>
            <PagBtn disabled={page <= 1} onClick={() => goTo(page - 1)} title="Anterior">
              <HiOutlineChevronLeft className="h-4 w-4" />
            </PagBtn>
            {pageRange.map(p => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`min-w-[32px] h-8 rounded text-xs font-medium transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
            <PagBtn disabled={page >= totalPages} onClick={() => goTo(page + 1)} title="Siguiente">
              <HiOutlineChevronRight className="h-4 w-4" />
            </PagBtn>
            <PagBtn disabled={page >= totalPages} onClick={() => goTo(totalPages)} title="Última">
              <HiOutlineChevronDoubleRight className="h-4 w-4" />
            </PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── aux ─── */
const PagBtn: React.FC<{
  disabled: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ disabled, onClick, title, children }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    title={title}
    className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
      disabled
        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'
    }`}
  >
    {children}
  </button>
);

/* Re-export as generic + named generic for convenience */
export const DataTable = DataTableInner as <T>(props: DataTableProps<T>) => React.ReactElement;
export default DataTable;
