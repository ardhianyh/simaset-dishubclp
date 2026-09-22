import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Foto {
    id: number;
    nama: string;
    url: string;
}

interface Props {
    asset: {
        nama_barang: string;
        kode_barang: string;
        kib_type: string;
        kib_label: string;
        lokasi: string;
        pj_nama: string;
        pj_nip?: string;
    };
    fotos?: Foto[];
}

function Field({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="border-b py-3 last:border-b-0">
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{value || '-'}</dd>
        </div>
    );
}

export default function PublicAssetShow({ asset, fotos = [] }: Props) {
    const [aktif, setAktif] = useState(0);
    const fotoAktif = fotos[aktif];

    return (
        <>
            <Head title={`${asset.nama_barang} - Simaset`} />

            <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-8 sm:py-12">
                <div className="w-full max-w-md">
                    <div className="mb-6 text-center">
                        <h1 className="mt-3 text-lg font-bold tracking-tight text-gray-900">
                            Simaset Dinas Perhubungan Cilacap
                        </h1>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 bg-gray-900 px-5 py-4">
                            <h2 className="text-lg font-semibold text-white">
                                {asset.nama_barang}
                            </h2>
                            <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                                {asset.kib_label}
                            </span>
                        </div>

                        {fotoAktif && (
                            <div className="border-b border-gray-200">
                                <a href={fotoAktif.url} target="_blank" rel="noreferrer">
                                    <img
                                        src={fotoAktif.url}
                                        alt={asset.nama_barang}
                                        loading="lazy"
                                        className="aspect-[4/3] w-full bg-gray-100 object-cover"
                                    />
                                </a>

                                {fotos.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto px-3 py-3">
                                        {fotos.map((foto, index) => (
                                            <button
                                                key={foto.id}
                                                type="button"
                                                onClick={() => setAktif(index)}
                                                className={`size-14 shrink-0 overflow-hidden rounded-md border-2 ${
                                                    index === aktif
                                                        ? 'border-gray-900'
                                                        : 'border-transparent'
                                                }`}
                                            >
                                                <img
                                                    src={foto.url}
                                                    alt={foto.nama}
                                                    loading="lazy"
                                                    className="size-full bg-gray-100 object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <dl className="px-5">
                            <Field label="Kode Barang" value={asset.kode_barang} />
                            <Field label="Kategori" value={asset.kib_label} />
                            <Field label="Lokasi" value={asset.lokasi} />
                            <Field label="Penanggung Jawab" value={asset.pj_nama} />
                            {asset.pj_nip && (
                                <Field label="NIP Penanggung Jawab" value={asset.pj_nip} />
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </>
    );
}
