import React from 'react';

export default function StatCard({ label, value, unit = '', info = '', icon: Icon = null }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {label}
                </span>
                {Icon && (
                    <span className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                )}
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                    {value}
                </span>
                {unit && <span className="text-sm font-medium text-slate-600">{unit}</span>}
            </div>

            {info && <p className="text-xs text-slate-600">{info}</p>}
        </div>
    );
}
