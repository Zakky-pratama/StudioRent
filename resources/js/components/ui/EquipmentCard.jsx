import React, { useEffect, useState } from 'react';
import { Building2, Disc3, Guitar, Info, Music, Piano, Speaker } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatRupiah } from '../../utils/formatters';

function getCategoryIcon(categoryName = '') {
    const lower = categoryName.toLowerCase();
    if (lower.includes('gitar') || lower.includes('bass')) return Guitar;
    if (lower.includes('drum') || lower.includes('perkusi')) return Disc3;
    if (lower.includes('sound') || lower.includes('mixer') || lower.includes('mic')) return Speaker;
    if (lower.includes('studio') || lower.includes('ruang')) return Building2;
    if (lower.includes('keyboard') || lower.includes('piano') || lower.includes('synth')) return Piano;
    return Music;
}

export default function EquipmentCard({ equipment, onAddToEstimator, onShowDetail }) {
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [equipment.gambar]);

    const available = Number(equipment.stok) > 0;
    const categoryName = equipment.category?.nama_kategori || 'Alat & Studio';
    const IconComponent = getCategoryIcon(categoryName);
    const unitLabel = equipment.satuan_sewa === 'jam' ? 'Ruang' : 'Unit';

    return (
        <article className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between transition hover:border-slate-300">
            <div>
                <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                    {equipment.gambar && !imgError ? (
                        <img
                            src={equipment.gambar}
                            alt={equipment.nama_alat}
                            width={640}
                            height={400}
                            onError={() => setImgError(true)}
                            className={`aspect-[16/10] w-full h-full object-cover ${available ? '' : 'opacity-80'}`}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-center">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                                <IconComponent className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 line-clamp-1">
                                {equipment.merk || categoryName}
                            </span>
                        </div>
                    )}

                    <div className="absolute top-2.5 right-2.5">
                        {available ? (
                            <StatusBadge
                                status="tersedia"
                                label={`Tersedia • ${equipment.stok} ${unitLabel}`}
                            />
                        ) : (
                            <StatusBadge status="sedang_disewa" label="Sedang Disewa" />
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {categoryName}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {equipment.nama_alat}
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-1">
                        {equipment.merk ? `${equipment.merk} • ` : ''}
                        {equipment.spesifikasi || `Kondisi: ${equipment.kondisi}`}
                    </p>
                </div>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatRupiah(equipment.harga_sewa)}
                    </span>
                    <span className="text-xs text-slate-600">/ {equipment.satuan_sewa}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {available ? (
                        <>
                            {onShowDetail && (
                                <button
                                    type="button"
                                    onClick={() => onShowDetail(equipment)}
                                    aria-label={`Lihat detail ${equipment.nama_alat}`}
                                    className="w-10 h-11 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <Info className="w-4 h-4" aria-hidden="true" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onAddToEstimator(equipment)}
                                className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition-colors"
                            >
                                Sewa
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onShowDetail(equipment)}
                            className="min-h-[44px] px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                        >
                            Detail
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
