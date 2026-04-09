import { Wilayah, KibType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import KibAFields from './KibAFields';
import KibBFields from './KibBFields';
import KibCFields from './KibCFields';
import KibDFields from './KibDFields';
import KibEFields from './KibEFields';
import KibLFields from './KibLFields';

interface Props {
    kibType: KibType;
    kibLabel: string;
    wilayahs: Wilayah[];
    asalUsulOptions: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    setData: (key: string, value: unknown) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detail: Record<string, any>;
    setDetail: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: FormEvent) => void;
    isEdit?: boolean;
}

export default function AssetForm({
    kibType,
    kibLabel,
    wilayahs,
    asalUsulOptions,
    data,
    setData,
    detail,
    setDetail,
    errors,
    processing,
    onSubmit,
    isEdit = false,
}: Props) {
    const kibSlug = `kib-${kibType.toLowerCase()}`;

    const renderKibFields = () => {
        const props = { detail, setDetail, errors };

        switch (kibType) {
            case 'A': return <KibAFields {...props} />;
            case 'B': return <KibBFields {...props} />;
            case 'C': return <KibCFields {...props} />;
            case 'D': return <KibDFields {...props} />;
            case 'E': return <KibEFields {...props} />;
            case 'L': return <KibLFields {...props} />;
        }
    };

    return (
        <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Data Umum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Nama Barang *</Label>
                            <Input
                                value={(data.nama_barang as string) ?? ''}
                                onChange={(e) => setData('nama_barang', e.target.value)}
                                placeholder="Jenis / Nama Barang"
                            />
                            {errors.nama_barang && <p className="text-sm text-red-600">{errors.nama_barang}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Kode Barang *</Label>
                            <Input
                                value={(data.kode_barang as string) ?? ''}
                                onChange={(e) => setData('kode_barang', e.target.value)}
                                placeholder="XX.XX.XX.XX.XXX"
                            />
                            {errors.kode_barang && <p className="text-sm text-red-600">{errors.kode_barang}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Nomor Register *</Label>
                            <Input
                                value={(data.nomor_register as string) ?? ''}
                                onChange={(e) => setData('nomor_register', e.target.value)}
                                placeholder="Nomor register"
                            />
                            {errors.nomor_register && <p className="text-sm text-red-600">{errors.nomor_register}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Asal Usul *</Label>
                            <Select
                                value={(data.asal_usul as string) || ''}
                                onValueChange={(v) => setData('asal_usul', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih asal usul" />
                                </SelectTrigger>
                                <SelectContent>
                                    {asalUsulOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.asal_usul && <p className="text-sm text-red-600">{errors.asal_usul}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Harga (Rp) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={data.harga as number ?? ''}
                                onChange={(e) => setData('harga', e.target.value)}
                                placeholder="0"
                            />
                            {errors.harga && <p className="text-sm text-red-600">{errors.harga}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Wilayah</Label>
                        <Select
                            value={data.wilayah_id ? String(data.wilayah_id) : ''}
                            onValueChange={(v) => setData('wilayah_id', v ? Number(v) : null)}
                        >
                            <SelectTrigger className="max-w-sm">
                                <SelectValue placeholder="Pilih wilayah" />
                            </SelectTrigger>
                            <SelectContent>
                                {wilayahs.map((w) => (
                                    <SelectItem key={w.id} value={String(w.id)}>{w.nama}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.wilayah_id && <p className="text-sm text-red-600">{errors.wilayah_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Keterangan</Label>
                        <Textarea
                            value={(data.keterangan as string) ?? ''}
                            onChange={(e) => setData('keterangan', e.target.value)}
                            placeholder="Keterangan tambahan (opsional)"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detail {kibLabel}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {renderKibFields()}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Penanggung Jawab</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Nama PJ *</Label>
                            <Input
                                value={(data.pj_nama as string) ?? ''}
                                onChange={(e) => setData('pj_nama', e.target.value)}
                                placeholder="Nama penanggung jawab"
                            />
                            {errors.pj_nama && <p className="text-sm text-red-600">{errors.pj_nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>NIP PJ</Label>
                            <Input
                                value={(data.pj_nip as string) ?? ''}
                                onChange={(e) => setData('pj_nip', e.target.value)}
                                placeholder="Opsional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Telepon PJ</Label>
                            <Input
                                value={(data.pj_telepon as string) ?? ''}
                                onChange={(e) => setData('pj_telepon', e.target.value)}
                                placeholder="Opsional"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Alamat PJ</Label>
                        <Textarea
                            value={(data.pj_alamat as string) ?? ''}
                            onChange={(e) => setData('pj_alamat', e.target.value)}
                            placeholder="Alamat rumah/domisili penanggung jawab (opsional)"
                            rows={2}
                        />
                        {errors.pj_alamat && <p className="text-sm text-red-600">{errors.pj_alamat}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Koordinat (Opsional)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input
                                type="number"
                                step="0.00000001"
                                value={data.latitude as number ?? ''}
                                onChange={(e) => setData('latitude', e.target.value || null)}
                                placeholder="-7.12345678"
                            />
                            {errors.latitude && <p className="text-sm text-red-600">{errors.latitude}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input
                                type="number"
                                step="0.00000001"
                                value={data.longitude as number ?? ''}
                                onChange={(e) => setData('longitude', e.target.value || null)}
                                placeholder="109.12345678"
                            />
                            {errors.longitude && <p className="text-sm text-red-600">{errors.longitude}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href={`/assets/${kibSlug}`}>Batal</Link>
                </Button>
            </div>
        </form>
    );
}
