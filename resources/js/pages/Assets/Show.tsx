import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Asset, KibType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, ArrowLeft, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import DocumentSection from './Partials/DocumentSection';
import PaktaIntegritasDialog from './Partials/PaktaIntegritasDialog';
import BastDialog from './Partials/BastDialog';

interface Props {
    asset: Asset;
    kibType: KibType;
    kibLabel: string;
    jenisOptions: string[];
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

export default function AssetShow({ asset, kibType, kibLabel, jenisOptions }: Props) {
    const kibSlug = `kib-${kibType.toLowerCase()}`;
    const detailKey = `kib_${kibType.toLowerCase()}_detail` as keyof Asset;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detail = (asset[detailKey] as Record<string, any>) || {};

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
                                <PaktaIntegritasDialog asset={asset} />
                                <BastDialog asset={asset} />
                            </>
                        )}
                        <Button size="sm" asChild>
                            <Link href={`/assets/${kibSlug}/${asset.id}/edit`}>
                                <Pencil className="mr-2 size-4" />
                                Edit Aset
                            </Link>
                        </Button>
                    </div>
                </div>

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
                            <Field label="Wilayah" value={asset.wilayah?.nama} />
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
