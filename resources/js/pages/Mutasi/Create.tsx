import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Asset, Ruangan } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import PenanggungJawabInput from '@/components/PenanggungJawabInput';
import { toast } from 'sonner';
import { formatValidationErrors } from '@/utils/formatErrors';

interface Props {
    ruangans: Ruangan[];
    assets: Asset[];
    ruanganAsalId: number | null;
}

type Jenis = 'pindah_ruangan' | 'ganti_pj';

export default function MutasiCreate({ ruangans, assets, ruanganAsalId }: Props) {
    const [jenis, setJenis] = useState<Jenis>('pindah_ruangan');
    const [ruanganAsal, setRuanganAsal] = useState<string>(ruanganAsalId ? String(ruanganAsalId) : '');
    const [ruanganTujuan, setRuanganTujuan] = useState<string>('');
    const [selected, setSelected] = useState<number[]>([]);
    const [cari, setCari] = useState('');
    const [nomorBast, setNomorBast] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
    const [pjAsalNama, setPjAsalNama] = useState('');
    const [pjAsalNip, setPjAsalNip] = useState('');
    const [pjTujuanNama, setPjTujuanNama] = useState('');
    const [pjTujuanNip, setPjTujuanNip] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [dokumen, setDokumen] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const gantiPj = jenis === 'ganti_pj';
    // Ganti PJ berarti barang tetap di ruangan yang sama.
    const tujuan = gantiPj ? ruanganAsal : ruanganTujuan;
    const ruanganTujuanOptions = ruangans.filter((r) => String(r.id) !== ruanganAsal);

    function handleJenis(value: Jenis) {
        setJenis(value);
        setRuanganTujuan('');
        setPjTujuanNama('');
        setPjTujuanNip('');
    }

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
        const ruangan = ruangans.find((r) => String(r.id) === value);
        setPjAsalNama(ruangan?.pj_nama ?? '');
        setPjAsalNip(ruangan?.pj_nip ?? '');
        if (value === ruanganTujuan) {
            setRuanganTujuan('');
            setPjTujuanNama('');
            setPjTujuanNip('');
        }

        router.get(
            '/mutasi/create',
            { ruangan_asal_id: value },
            { preserveState: true, preserveScroll: true, only: ['assets', 'ruanganAsalId'] },
        );
    }

    function handleRuanganTujuan(value: string) {
        setRuanganTujuan(value);
        const ruangan = ruangans.find((r) => String(r.id) === value);
        setPjTujuanNama(ruangan?.pj_nama ?? '');
        setPjTujuanNip(ruangan?.pj_nip ?? '');
    }

    function toggleAsset(id: number) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    function toggleSemua() {
        const idsTersaring = assetsTersaring.map((a) => a.id);
        const semuaTerpilih = idsTersaring.every((id) => selected.includes(id));
        setSelected(semuaTerpilih ? selected.filter((id) => !idsTersaring.includes(id)) : Array.from(new Set([...selected, ...idsTersaring])));
    }

    function paramsDasar() {
        const params = new URLSearchParams();
        params.set('ruangan_asal_id', ruanganAsal);
        params.set('ruangan_tujuan_id', tujuan);
        params.set('nomor_bast', nomorBast);
        params.set('tanggal', tanggal);
        if (pjAsalNama) params.set('pj_asal_nama', pjAsalNama);
        if (pjAsalNip) params.set('pj_asal_nip', pjAsalNip);
        if (pjTujuanNama) params.set('pj_tujuan_nama', pjTujuanNama);
        if (pjTujuanNip) params.set('pj_tujuan_nip', pjTujuanNip);
        if (keterangan) params.set('keterangan', keterangan);
        selected.forEach((id) => params.append('asset_ids[]', String(id)));
        return params;
    }

    function cetakDraft() {
        if (!ruanganAsal || !tujuan || selected.length === 0 || !nomorBast) {
            toast.error(
                gantiPj
                    ? 'Lengkapi ruangan, nomor BAST, dan pilih barangnya dulu.'
                    : 'Lengkapi ruangan asal, ruangan tujuan, nomor BAST, dan pilih barangnya dulu.',
            );
            return;
        }
        if (gantiPj && !pjTujuanNama) {
            toast.error('Isi penanggung jawab baru dulu.');
            return;
        }
        window.open(`/mutasi/draft-bast?${paramsDasar().toString()}`, '_blank');
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            '/mutasi',
            {
                ruangan_asal_id: ruanganAsal,
                ruangan_tujuan_id: tujuan,
                nomor_bast: nomorBast,
                tanggal,
                pj_asal_nama: pjAsalNama,
                pj_asal_nip: pjAsalNip,
                pj_tujuan_nama: pjTujuanNama,
                pj_tujuan_nip: pjTujuanNip,
                keterangan,
                asset_ids: selected,
                dokumen,
            },
            {
                forceFormData: true,
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
        <AuthenticatedLayout header={gantiPj ? 'Ganti Penanggung Jawab Barang' : 'Geser Barang Antar Ruangan'}>
            <Head title="Geser Barang" />

            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Button type="button" variant="ghost" size="sm" asChild>
                        <Link href="/mutasi">
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Jenis Pergeseran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(
                                [
                                    {
                                        value: 'pindah_ruangan',
                                        judul: 'Pindah ruangan',
                                        keterangan: 'Barang berpindah ke ruangan lain beserta penanggung jawabnya.',
                                    },
                                    {
                                        value: 'ganti_pj',
                                        judul: 'Ganti penanggung jawab',
                                        keterangan: 'Barang tetap di ruangan yang sama, hanya penanggung jawabnya berganti.',
                                    },
                                ] as const
                            ).map((opsi) => (
                                <button
                                    key={opsi.value}
                                    type="button"
                                    onClick={() => handleJenis(opsi.value)}
                                    className={`rounded-md border p-3 text-left transition-colors ${
                                        jenis === opsi.value ? 'border-primary bg-primary/5 ring-primary ring-1' : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <p className="text-sm font-medium">{opsi.judul}</p>
                                    <p className="text-muted-foreground text-xs">{opsi.keterangan}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ruangan</CardTitle>
                        <CardDescription>
                            {gantiPj
                                ? 'Pilih ruangan, lalu centang barang yang berganti penanggung jawab.'
                                : 'Pilih ruangan asal, lalu centang barang yang akan digeser ke ruangan tujuan.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{gantiPj ? 'Ruangan *' : 'Ruangan Asal *'}</Label>
                                <Select value={ruanganAsal} onValueChange={handleRuanganAsal}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih ruangan asal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ruangans.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.ruangan_asal_id && <p className="text-sm text-red-600">{errors.ruangan_asal_id}</p>}
                            </div>
                            {!gantiPj && (
                                <div className="space-y-2">
                                    <Label>Ruangan Tujuan *</Label>
                                    <Select value={ruanganTujuan} onValueChange={handleRuanganTujuan}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih ruangan tujuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ruanganTujuanOptions.map((r) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ruangan_tujuan_id && <p className="text-sm text-red-600">{errors.ruangan_tujuan_id}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{gantiPj ? 'Penanggung Jawab Lama' : 'Penanggung Jawab Asal'}</Label>
                                <PenanggungJawabInput
                                    value={pjAsalNama}
                                    onChange={setPjAsalNama}
                                    onPick={(p) => {
                                        setPjAsalNama(p.nama);
                                        setPjAsalNip(p.nip ?? '');
                                    }}
                                />
                                <Input value={pjAsalNip} onChange={(e) => setPjAsalNip(e.target.value)} placeholder="NIP" />
                            </div>
                            <div className="space-y-2">
                                <Label>{gantiPj ? 'Penanggung Jawab Baru *' : 'Penanggung Jawab Tujuan'}</Label>
                                <PenanggungJawabInput
                                    value={pjTujuanNama}
                                    onChange={setPjTujuanNama}
                                    onPick={(p) => {
                                        setPjTujuanNama(p.nama);
                                        setPjTujuanNip(p.nip ?? '');
                                    }}
                                />
                                <Input value={pjTujuanNip} onChange={(e) => setPjTujuanNip(e.target.value)} placeholder="NIP" />
                                {errors.pj_tujuan_nama && <p className="text-sm text-red-600">{errors.pj_tujuan_nama}</p>}
                                <p className="text-muted-foreground text-xs">
                                    Nama ini akan menjadi penanggung jawab baru untuk semua barang yang dipilih.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{gantiPj ? 'Barang yang Berganti Penanggung Jawab' : 'Barang yang Digeser'}</CardTitle>
                        <CardDescription>
                            {ruanganAsal
                                ? `${selected.length} dari ${assets.length} barang dipilih`
                                : 'Pilih ruangan asal terlebih dahulu'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {ruanganAsal && assets.length > 0 && (
                            <>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Cari nama, kode, atau register..."
                                        value={cari}
                                        onChange={(e) => setCari(e.target.value)}
                                        className="max-w-sm"
                                    />
                                    <Button type="button" variant="secondary" size="sm" onClick={toggleSemua}>
                                        Pilih semua
                                    </Button>
                                </div>

                                <div className="max-h-96 divide-y overflow-y-auto rounded-md border">
                                    {assetsTersaring.map((asset) => (
                                        <label
                                            key={asset.id}
                                            className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 p-3"
                                        >
                                            <Checkbox
                                                checked={selected.includes(asset.id)}
                                                onCheckedChange={() => toggleAsset(asset.id)}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{asset.nama_barang}</p>
                                                <p className="text-muted-foreground font-mono text-xs">
                                                    {asset.kode_barang} · {asset.nomor_register}
                                                </p>
                                            </div>
                                            <div className="text-muted-foreground hidden shrink-0 text-right text-xs sm:block">
                                                PJ: {asset.pj_nama || '-'}
                                            </div>
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
                            <p className="text-muted-foreground py-4 text-center text-sm">
                                Ruangan ini belum memiliki barang.
                            </p>
                        )}

                        {errors.asset_ids && <p className="text-sm text-red-600">{errors.asset_ids}</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Berita Acara Serah Terima</CardTitle>
                        <CardDescription>
                            Cetak draft BAST untuk ditandatangani, lalu unggah kembali hasil tanda tangannya.
                            {gantiPj
                                ? 'Penanggung jawab baru berlaku setelah dokumen ini diunggah.'
                                : 'Barang baru berpindah setelah dokumen ini diunggah.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nomor BAST *</Label>
                                <Input
                                    value={nomorBast}
                                    onChange={(e) => setNomorBast(e.target.value)}
                                    placeholder="000.3.2/.../21/2026"
                                />
                                {errors.nomor_bast && <p className="text-sm text-red-600">{errors.nomor_bast}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal *</Label>
                                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                                {errors.tanggal && <p className="text-sm text-red-600">{errors.tanggal}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Keterangan</Label>
                            <Textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder={gantiPj ? 'Alasan pergantian penanggung jawab (opsional)' : 'Alasan pergeseran (opsional)'}
                                rows={2}
                            />
                        </div>

                        <Button type="button" variant="outline" size="sm" onClick={cetakDraft}>
                            <FileText className="mr-2 size-4" />
                            Cetak Draft BAST
                        </Button>

                        <div className="space-y-2 border-t pt-4">
                            <Label>Upload BAST Bertanda Tangan *</Label>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setDokumen(e.target.files?.[0] ?? null)}
                            />
                            <p className="text-muted-foreground text-xs">
                                Format PDF/JPG/PNG, maksimal 10 MB.
                            </p>
                            {errors.dokumen && <p className="text-sm text-red-600">{errors.dokumen}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={processing}>
                        <Upload className="mr-2 size-4" />
                        {processing ? 'Memproses...' : gantiPj ? 'Proses Ganti Penanggung Jawab' : 'Proses Pergeseran'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/mutasi">Batal</Link>
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
