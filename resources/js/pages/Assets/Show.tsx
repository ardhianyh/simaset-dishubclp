import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Asset, AssetGeneratedDocument, AssetLoan, KibType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, ArrowLeft, QrCode, Handshake } from 'lucide-react';
import QRCode from 'react-qr-code';
import DocumentSection from './Partials/DocumentSection';
import PhotoSection from './Partials/PhotoSection';
import PaktaIntegritasDialog from './Partials/PaktaIntegritasDialog';
import BastDialog from './Partials/BastDialog';
import KembalikanDialog from '@/pages/Peminjaman/Partials/KembalikanDialog';
import { formatWaktu, terlambat } from '@/utils/waktu';

interface RiwayatMutasi {
    id: number;
    pj_asal_nama?: string | null;
    mutation?: {
        id: number;
        nomor_bast: string;
        tanggal: string;
        jenis: 'pindah_ruangan' | 'ganti_pj';
        ruangan_asal_nama: string;
        ruangan_tujuan_nama: string;
        pj_tujuan_nama?: string | null;
    };
}

interface Props {
    asset: Asset;
    kibType: KibType;
    kibLabel: string;
    jenisOptions: string[];
    generatedDocuments?: Record<string, AssetGeneratedDocument>;
    riwayatMutasi?: RiwayatMutasi[];
    riwayatPeminjaman?: AssetLoan[];
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
    let display: string;
    if (value === null || value === undefined || value === '') {
        display = '-';
    } else if (typeof value === 'boolean') {
        display = value ? 'Ya' : 'Tidak';
    } else {
        display = String(value);
    }

    return (
        <div>
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="font-medium">{display}</dd>
        </div>
    );
}

export default function AssetShow({ asset, kibType, kibLabel, jenisOptions, generatedDocuments, riwayatMutasi = [], riwayatPeminjaman = [] }: Props) {
    const kibSlug = `kib-${kibType.toLowerCase()}`;
    const detailKey = `kib_${kibType.toLowerCase()}_detail` as keyof Asset;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detail = (asset[detailKey] as Record<string, any>) || {};
    const pinjamanAktif = riwayatPeminjaman.find((p) => !p.dikembalikan_pada);

    return (
        <AuthenticatedLayout header={`Detail ${kibLabel}`}>
            <Head title={`Detail - ${asset.nama_barang}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/assets/${kibSlug}`}>
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        {kibType === 'B' && (
                            <>
                                <PaktaIntegritasDialog
                                    asset={asset}
                                    generatedDocument={generatedDocuments?.pakta_integritas}
                                />
                                <BastDialog
                                    asset={asset}
                                    generatedDocument={generatedDocuments?.bast}
                                />
                            </>
                        )}
                        {!pinjamanAktif && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/peminjaman/create?asset_id=${asset.id}`}>
                                    <Handshake className="mr-2 size-4" />
                                    Pinjamkan
                                </Link>
                            </Button>
                        )}
                        <Button size="sm" asChild>
                            <Link href={`/assets/${kibSlug}/${asset.id}/edit`}>
                                <Pencil className="mr-2 size-4" />
                                Edit Aset
                            </Link>
                        </Button>
                    </div>
                </div>

                {pinjamanAktif && (
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                        <Handshake className="size-5 shrink-0 text-amber-600" />
                        <div className="min-w-0 flex-1 text-sm">
                            <p className="font-medium">
                                Sedang dipinjam {pinjamanAktif.peminjam_nama} ({pinjamanAktif.peminjam_ruangan_nama})
                                {terlambat(pinjamanAktif.rencana_kembali, pinjamanAktif.dikembalikan_pada) && (
                                    <Badge variant="destructive" className="ml-2">
                                        Terlambat
                                    </Badge>
                                )}
                            </p>
                            <p className="text-muted-foreground">
                                Sejak {formatWaktu(pinjamanAktif.dipinjam_pada)} · {pinjamanAktif.keperluan}
                            </p>
                        </div>
                        <KembalikanDialog loan={pinjamanAktif} namaBarang={asset.nama_barang} />
                    </div>
                )}

                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="shrink-0 rounded border p-1.5">
                        <QRCode
                            value={`${window.location.origin}/p/${asset.id}`}
                            size={64}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-sm">
                            Scan QR code untuk melihat info aset secara publik.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link href={`/assets/${kibSlug}/${asset.id}/qr-label`}>
                                <QrCode className="mr-2 size-4" />
                                Cetak Label QR
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {asset.nama_barang}
                            <Badge variant="secondary">{kibLabel}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 sm:grid-cols-3">
                            <Field label="Kode Barang" value={asset.kode_barang} />
                            <Field label="Nomor Register" value={asset.nomor_register} />
                            <Field label="Asal Usul" value={asset.asal_usul} />
                            <Field label="Harga" value={formatCurrency(asset.harga)} />
                            <Field label="Ruangan" value={asset.ruangan?.nama} />
                            <Field label="Keterangan" value={asset.keterangan} />
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Detail {kibLabel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 sm:grid-cols-3">
                            {kibType === 'A' && (
                                <>
                                    <Field label="Luas (M2)" value={detail.luas_m2} />
                                    <Field label="Tahun Pengadaan" value={detail.tahun_pengadaan} />
                                    <Field label="Alamat" value={detail.alamat} />
                                    <Field label="Hak Tanah" value={detail.hak_tanah} />
                                    <Field label="Sertifikat Tanggal" value={detail.sertifikat_tanggal} />
                                    <Field label="Sertifikat Nomor" value={detail.sertifikat_nomor} />
                                    <Field label="Penggunaan" value={detail.penggunaan} />
                                </>
                            )}
                            {kibType === 'B' && (
                                <>
                                    <Field label="Merk/Type" value={detail.merk_type} />
                                    <Field label="Ukuran/CC" value={detail.ukuran_cc} />
                                    <Field label="Bahan" value={detail.bahan} />
                                    <Field label="Tahun Pembelian" value={detail.tahun_pembelian} />
                                    <Field label="Nomor Pabrik" value={detail.nomor_pabrik} />
                                    <Field label="Nomor Rangka" value={detail.nomor_rangka} />
                                    <Field label="Nomor Mesin" value={detail.nomor_mesin} />
                                    <Field label="Nomor Polisi" value={detail.nomor_polisi} />
                                    <Field label="Nomor BPKB" value={detail.nomor_bpkb} />
                                </>
                            )}
                            {kibType === 'C' && (
                                <>
                                    <Field label="Kondisi" value={detail.kondisi} />
                                    <Field label="Bertingkat" value={detail.bertingkat} />
                                    <Field label="Konstruksi Beton" value={detail.beton} />
                                    <Field label="Luas Lantai (M2)" value={detail.luas_lantai_m2} />
                                    <Field label="Alamat" value={detail.alamat} />
                                    <Field label="Dokumen Tanggal" value={detail.dokumen_tanggal} />
                                    <Field label="Dokumen Nomor" value={detail.dokumen_nomor} />
                                    <Field label="Status Tanah" value={detail.status_tanah} />
                                    <Field label="Nomor Kode Tanah" value={detail.nomor_kode_tanah} />
                                </>
                            )}
                            {kibType === 'D' && (
                                <>
                                    <Field label="Konstruksi" value={detail.konstruksi} />
                                    <Field label="Panjang (Km)" value={detail.panjang_km} />
                                    <Field label="Lebar (M)" value={detail.lebar_m} />
                                    <Field label="Luas (M2)" value={detail.luas_m2} />
                                    <Field label="Alamat" value={detail.alamat} />
                                    <Field label="Dokumen Tanggal" value={detail.dokumen_tanggal} />
                                    <Field label="Dokumen Nomor" value={detail.dokumen_nomor} />
                                    <Field label="Status Tanah" value={detail.status_tanah} />
                                    <Field label="Nomor Kode Tanah" value={detail.nomor_kode_tanah} />
                                    <Field label="Kondisi" value={detail.kondisi} />
                                </>
                            )}
                            {kibType === 'E' && (
                                <>
                                    <Field label="Jumlah" value={detail.jumlah} />
                                    <Field label="Tahun Cetak" value={detail.tahun_cetak} />
                                    <Field label="Judul/Pencipta" value={detail.judul_pencipta} />
                                    <Field label="Spesifikasi" value={detail.spesifikasi} />
                                    <Field label="Asal Daerah" value={detail.asal_daerah} />
                                    <Field label="Pencipta" value={detail.pencipta} />
                                    <Field label="Bahan" value={detail.bahan} />
                                    <Field label="Jenis" value={detail.jenis} />
                                    <Field label="Ukuran" value={detail.ukuran} />
                                </>
                            )}
                            {kibType === 'L' && (
                                <>
                                    <Field label="Tahun Pengadaan" value={detail.tahun_pengadaan} />
                                    <Field label="Judul/Nama" value={detail.judul_nama} />
                                    <Field label="Pencipta" value={detail.pencipta} />
                                    <Field label="Spesifikasi" value={detail.spesifikasi} />
                                    <Field label="Kondisi" value={detail.kondisi} />
                                </>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Penanggung Jawab</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 sm:grid-cols-3">
                            <Field label="Nama" value={asset.pj_nama} />
                            <Field label="NIP" value={asset.pj_nip} />
                            <Field label="Telepon" value={asset.pj_telepon} />
                            <Field label="Alamat" value={asset.pj_alamat} />
                        </dl>
                    </CardContent>
                </Card>

                {(asset.latitude || asset.longitude) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Koordinat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <Field label="Latitude" value={asset.latitude} />
                                <Field label="Longitude" value={asset.longitude} />
                            </dl>
                        </CardContent>
                    </Card>
                )}

                {riwayatMutasi.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Riwayat Pergeseran &amp; Penanggung Jawab</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-3">
                                {riwayatMutasi.map((riwayat) => (
                                    <li key={riwayat.id} className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="text-muted-foreground w-32 shrink-0 text-xs">
                                            {riwayat.mutation
                                                ? new Date(riwayat.mutation.tanggal).toLocaleDateString('id-ID', {
                                                      day: '2-digit',
                                                      month: 'long',
                                                      year: 'numeric',
                                                  })
                                                : '-'}
                                        </span>
                                        {riwayat.mutation?.jenis === 'ganti_pj' ? (
                                            <>
                                                <span>PJ {riwayat.pj_asal_nama || '-'}</span>
                                                <span className="text-muted-foreground">&rarr;</span>
                                                <span className="font-medium">{riwayat.mutation.pj_tujuan_nama}</span>
                                                <span className="text-muted-foreground text-xs">({riwayat.mutation.ruangan_asal_nama})</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{riwayat.mutation?.ruangan_asal_nama}</span>
                                                <span className="text-muted-foreground">&rarr;</span>
                                                <span className="font-medium">{riwayat.mutation?.ruangan_tujuan_nama}</span>
                                            </>
                                        )}
                                        {riwayat.mutation && (
                                            <Link
                                                href={`/mutasi/${riwayat.mutation.id}`}
                                                className="text-muted-foreground hover:text-foreground text-xs underline"
                                            >
                                                BAST {riwayat.mutation.nomor_bast}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                )}

                {riwayatPeminjaman.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Riwayat Peminjaman</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="divide-y">
                                {riwayatPeminjaman.map((pinjam) => (
                                    <li key={pinjam.id} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">
                                                {pinjam.peminjam_nama}{' '}
                                                <span className="text-muted-foreground font-normal">({pinjam.peminjam_ruangan_nama})</span>
                                            </p>
                                            <p className="text-muted-foreground">{pinjam.keperluan}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {formatWaktu(pinjam.dipinjam_pada)} &rarr;{' '}
                                                {pinjam.dikembalikan_pada ? formatWaktu(pinjam.dikembalikan_pada) : 'belum kembali'}
                                            </p>
                                        </div>
                                        <Badge variant={pinjam.dikembalikan_pada ? 'secondary' : 'default'}>
                                            {pinjam.dikembalikan_pada ? 'Sudah kembali' : 'Sedang dipinjam'}
                                        </Badge>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                )}

                <PhotoSection
                    asset={asset}
                    kibSlug={kibSlug}
                />

                <DocumentSection
                    asset={asset}
                    kibSlug={kibSlug}
                    jenisOptions={jenisOptions}
                />

                {(asset.creator || asset.updater) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informasi Audit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <Field label="Dibuat oleh" value={asset.creator?.name} />
                                <Field label="Tanggal dibuat" value={asset.created_at ? new Date(asset.created_at).toLocaleString('id-ID') : undefined} />
                                <Field label="Diubah oleh" value={asset.updater?.name} />
                                <Field label="Tanggal diubah" value={asset.updated_at ? new Date(asset.updated_at).toLocaleString('id-ID') : undefined} />
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
