import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';

export default function DataTable({
    title,
    subtitle = '',
    countLabel = '',
    searchValue = '',
    onSearchChange = null,
    searchPlaceholder = 'Cari data...',
    filterValue = '',
    onFilterChange = null,
    filterOptions = [],
    toolbarRight = null,
    columns = [],
    data = [],
    loading = false,
    error = '',
    onRetry = null,
    emptyTitle = 'Belum ada data.',
    emptyDescription = '',
    emptyAction = null,
    pagination = null,
    onPageChange = null,
    rowKey = (row) => row.id,
}) {
    const pages = [];
    if (pagination && pagination.last_page > 1) {
        for (let p = 1; p <= pagination.last_page; p += 1) {
            pages.push(p);
        }
    }

    return (
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {(title || onSearchChange || onFilterChange || toolbarRight) && (
                <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2.5">
                                {title && (
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                        {title}
                                    </h2>
                                )}
                                {countLabel && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold tabular-nums">
                                        {countLabel}
                                    </span>
                                )}
                            </div>
                            {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {onSearchChange && (
                            <div className="relative flex-1 sm:flex-initial sm:w-64">
                                <label htmlFor={`table-search-${title}`} className="sr-only">
                                    {searchPlaceholder}
                                </label>
                                <Search
                                    className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    aria-hidden="true"
                                />
                                <input
                                    id={`table-search-${title}`}
                                    type="search"
                                    value={searchValue}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-amber-800 focus:outline-none"
                                />
                            </div>
                        )}

                        {onFilterChange && filterOptions.length > 0 && (
                            <div>
                                <label htmlFor={`table-filter-${title}`} className="sr-only">
                                    Filter status
                                </label>
                                <select
                                    id={`table-filter-${title}`}
                                    value={filterValue}
                                    onChange={(e) => onFilterChange(e.target.value)}
                                    className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:border-amber-800 focus:outline-none"
                                >
                                    {filterOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {toolbarRight}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="p-8 text-center text-sm text-slate-600" role="status">
                    Memuat data dari server...
                </div>
            ) : error ? (
                <div className="p-8 flex flex-col items-center justify-center gap-3 text-center" role="alert">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" aria-hidden="true" />
                            <span>Coba Lagi</span>
                        </button>
                    )}
                </div>
            ) : data.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-sm font-semibold text-slate-900">{emptyTitle}</p>
                    {emptyDescription && (
                        <p className="text-xs text-slate-600 max-w-md">{emptyDescription}</p>
                    )}
                    {emptyAction && <div className="mt-2">{emptyAction}</div>}
                </div>
            ) : (
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-sm text-slate-800">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap ${
                                            col.headerClassName || ''
                                        }`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {data.map((row) => (
                                <tr key={rowKey(row)} className="hover:bg-slate-50/80 transition-colors">
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`py-3.5 px-4 align-middle ${col.cellClassName || ''}`}
                                        >
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && pagination.total > 0 && (
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-slate-600 tabular-nums">
                        Menampilkan <strong className="text-slate-900">{pagination.from || 1}-{pagination.to || data.length}</strong> dari{' '}
                        <strong className="text-slate-900">{pagination.total}</strong> data
                    </p>

                    {pagination.last_page > 1 && onPageChange && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                disabled={pagination.current_page <= 1}
                                onClick={() => onPageChange(pagination.current_page - 1)}
                                className="inline-flex items-center gap-1 px-3 min-h-[38px] rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 text-xs font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                                <span>Sebelumnya</span>
                            </button>

                            {pages.map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => onPageChange(pageNum)}
                                    aria-current={pageNum === pagination.current_page ? 'page' : undefined}
                                    className={`min-w-[38px] min-h-[38px] px-2.5 rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                                        pageNum === pagination.current_page
                                            ? 'bg-amber-800 text-white'
                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => onPageChange(pagination.current_page + 1)}
                                className="inline-flex items-center gap-1 px-3 min-h-[38px] rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 text-xs font-medium"
                            >
                                <span>Selanjutnya</span>
                                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
