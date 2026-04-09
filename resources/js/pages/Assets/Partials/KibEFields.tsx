import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detail: Record<string, any>;
    setDetail: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function KibEFields({ detail, setDetail, errors }: Props) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Jumlah *</Label>
                    <Input
                        type="number"
                        value={detail.jumlah ?? ''}
                        onChange={(e) => setDetail('jumlah', e.target.value)}
                        placeholder="1"
                    />
                    {errors['detail.jumlah'] && <p className="text-sm text-red-600">{errors['detail.jumlah']}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Tahun Cetak/Pembelian *</Label>
                    <Input
                        type="number"
                        value={detail.tahun_cetak ?? ''}
                        onChange={(e) => setDetail('tahun_cetak', e.target.value)}
                        placeholder="2024"
                    />
                    {errors['detail.tahun_cetak'] && <p className="text-sm text-red-600">{errors['detail.tahun_cetak']}</p>}
                </div>
            </div>

            <p className="text-muted-foreground text-sm font-medium">Buku / Perpustakaan</p>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Judul/Pencipta</Label>
                    <Input
                        value={(detail.judul_pencipta as string) ?? ''}
                        onChange={(e) => setDetail('judul_pencipta', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Spesifikasi</Label>
                    <Textarea
                        value={(detail.spesifikasi as string) ?? ''}
                        onChange={(e) => setDetail('spesifikasi', e.target.value)}
                        placeholder="Opsional"
                        rows={2}
                    />
                </div>
            </div>

            <p className="text-muted-foreground text-sm font-medium">Kesenian / Kebudayaan</p>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label>Asal Daerah</Label>
                    <Input
                        value={(detail.asal_daerah as string) ?? ''}
                        onChange={(e) => setDetail('asal_daerah', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Pencipta</Label>
                    <Input
                        value={(detail.pencipta as string) ?? ''}
                        onChange={(e) => setDetail('pencipta', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Bahan</Label>
                    <Input
                        value={(detail.bahan as string) ?? ''}
                        onChange={(e) => setDetail('bahan', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>

            <p className="text-muted-foreground text-sm font-medium">Hewan / Tumbuhan</p>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Jenis</Label>
                    <Input
                        value={(detail.jenis as string) ?? ''}
                        onChange={(e) => setDetail('jenis', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Ukuran</Label>
                    <Input
                        value={(detail.ukuran as string) ?? ''}
                        onChange={(e) => setDetail('ukuran', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>
        </>
    );
}
