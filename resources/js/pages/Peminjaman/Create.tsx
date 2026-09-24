import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Asset, Ruangan } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import PenanggungJawabInput from '@/components/PenanggungJawabInput';
import { toast } from 'sonner';
import { formatValidationErrors } from '@/utils/formatErrors';
import { waktuSekarang } from '@/utils/waktu';

type AssetPinjam = Asset & { sedang_dipinjam?: boolean };

interface Props {
    ruanganAsalOptions: Ruangan[];
    ruangans: Ruangan[];
    assets: AssetPinjam[];
    ruanganAsalId: number | null;
    assetId: number | null;
}

export default function PeminjamanCreate({ ruanganAsalOptions, ruangans, assets, ruanganAsalId, assetId }: Props) {
    const [ruanganAsal, setRuanganAsal] = useState<string>(ruanganAsalId ? String(ruanganAsalId) : '');
    const [selected, setSelected] = useState<number[]>(assetId ? [assetId] : []);
    const [cari, setCari] = useState('');
    const [peminjamNama, setPeminjamNama] = useState('');
    const [peminjamNip, setPeminjamNip] = useState('');
    const [peminjamRuangan, setPeminjamRuangan] = useState('');
    const [keperluan, setKeperluan] = useState('');
    const [dipinjamPada, setDipinjamPada] = useState(waktuSekarang());
    const [rencanaKembali, setRencanaKembali] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const assetsTersaring = useMemo(() => {
        const q = cari.trim().toLowerCase();
        if (!q) return assets;
        return assets.filter(
            (a) =>
                a.nama_barang.toLowerCase().includes(q) ||
                a.kode_barang.toLowerCase().includes(q) ||
                a.nomor_register.toLowerCase().includes(q),
        );
    }, [assets, cari]);

    function handleRuanganAsal(value: string) {
        setRuanganAsal(value);
        setSelected([]);
        router.get(
            '/peminjaman/create',
            { ruangan_asal_id: value },
            { preserveState: true, preserveScroll: true, only: ['assets', 'ruanganAsalId'] },
        );
    }

    function toggleAsset(id: number) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            '/peminjaman',
            {
                ruangan_asal_id: ruanganAsal,
                asset_ids: selected,
                peminjam_nama: peminjamNama,
                peminjam_nip: peminjamNip,
                peminjam_ruangan_id: peminjamRuangan,
                keperluan,
                dipinjam_pada: dipinjamPada,
                rencana_kembali: rencanaKembali || null,
            },
            {
                onError: (errs) => {
                    setProcessing(false);
                    setErrors(errs as Record<string, string>);
                    toast.error(formatValidationErrors(errs));
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <AuthenticatedLayout header="Catat Peminjaman Barang">
            <Head title="Catat Peminjaman" />

            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Button type="button" variant="ghost" size="sm" asChild>
                        <Link href="/peminjaman">
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Barang yang Dipinjam</CardTitle>
                        <CardDescription>
                            Barang tetap tercatat di ruangan dan penanggung jawab asalnya. Peminjaman hanya mencatat
                            siapa yang sedang memakai.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 sm:max-w-sm">
                            <Label>Ruangan Pemilik Barang *</Label>
                            <Select value={ruanganAsal} onValueChange={handleRuanganAsal}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih ruangan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ruanganAsalOptions.map((r) => (
                                        <SelectItem key={r.id} value={String(r.id)}>
                                            {r.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.ruangan_asal_id && <p className="text-sm text-red-600">{errors.ruangan_asal_id}</p>}
                        </div>

                        {ruanganAsal && assets.length > 0 && (
                            <>
                                <div className="flex items-center justify-between gap-2">
                                    <Input
                                        placeholder="Cari nama, kode, atau register..."
                                        value={cari}
                                        onChange={(e) => setCari(e.target.value)}
                                        className="max-w-sm"
                                    />
                                    <span className="text-muted-foreground text-sm">{selected.length} barang dipilih</span>
                                </div>

                                <div className="max-h-96 divide-y overflow-y-auto rounded-md border">
                                    {assetsTersaring.map((asset) => (
                                        <label
                                            key={asset.id}
                                            className={`flex items-center gap-3 p-3 ${
                                                asset.sedang_dipinjam ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/50 cursor-pointer'
                                            }`}
                                        >
                                            <Checkbox
                                                checked={selected.includes(asset.id)}
                                                disabled={asset.sedang_dipinjam}
                                                onCheckedChange={() => toggleAsset(asset.id)}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{asset.nama_barang}</p>
                                                <p className="text-muted-foreground font-mono text-xs">
                                                    {asset.kode_barang} · {asset.nomor_register}
                                                </p>
                                            </div>
                                            {asset.sedang_dipinjam && <Badge variant="outline">Sedang dipinjam</Badge>}
                                        </label>
                                    ))}
                                    {assetsTersaring.length === 0 && (
                                        <p className="text-muted-foreground p-4 text-center text-sm">
                                            Tidak ada barang yang cocok.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {ruanganAsal && assets.length === 0 && (
                            <p className="text-muted-foreground py-4 text-center text-sm">Ruangan ini belum memiliki barang.</p>
                        )}

                        {errors.asset_ids && <p className="text-sm text-red-600">{errors.asset_ids}</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Peminjam</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nama Penanggung Jawab Peminjam *</Label>
                                <PenanggungJawabInput
                                    value={peminjamNama}
                                    onChange={setPeminjamNama}
                                    onPick={(p) => {
                                        setPeminjamNama(p.nama);
                                        setPeminjamNip(p.nip ?? '');
                                    }}
                                />
                                <Input value={peminjamNip} onChange={(e) => setPeminjamNip(e.target.value)} placeholder="NIP" />
                                {errors.peminjam_nama && <p className="text-sm text-red-600">{errors.peminjam_nama}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Bidang/Ruangan Peminjam *</Label>
                                <Select value={peminjamRuangan} onValueChange={setPeminjamRuangan}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih bidang/ruangan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ruangans.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.peminjam_ruangan_id && (
                                    <p className="text-sm text-red-600">{errors.peminjam_ruangan_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Keperluan *</Label>
                            <Textarea
                                value={keperluan}
                                onChange={(e) => setKeperluan(e.target.value)}
                                placeholder="Contoh: dokumentasi kegiatan sosialisasi keselamatan lalu lintas"
                                rows={2}
                            />
                            {errors.keperluan && <p className="text-sm text-red-600">{errors.keperluan}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Tanggal &amp; Waktu Pinjam *</Label>
                                <Input
                                    type="datetime-local"
                                    value={dipinjamPada}
                                    onChange={(e) => setDipinjamPada(e.target.value)}
                                />
                                {errors.dipinjam_pada && <p className="text-sm text-red-600">{errors.dipinjam_pada}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Rencana Kembali</Label>
                                <Input
                                    type="datetime-local"
                                    value={rencanaKembali}
                                    onChange={(e) => setRencanaKembali(e.target.value)}
                                />
                                <p className="text-muted-foreground text-xs">
                                    Opsional. Waktu kembali yang sebenarnya dicatat saat barang diserahkan kembali.
                                </p>
                                {errors.rencana_kembali && <p className="text-sm text-red-600">{errors.rencana_kembali}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 size-4" />
                        {processing ? 'Menyimpan...' : 'Simpan Peminjaman'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/peminjaman">Batal</Link>
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
