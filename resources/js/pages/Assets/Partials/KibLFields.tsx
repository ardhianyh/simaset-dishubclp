import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detail: Record<string, any>;
    setDetail: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function KibLFields({ detail, setDetail, errors }: Props) {
    return (
        <>
            <div className="space-y-2">
                <Label>Tahun Pengadaan *</Label>
                <Input
                    type="number"
                    value={detail.tahun_pengadaan ?? ''}
                    onChange={(e) => setDetail('tahun_pengadaan', e.target.value)}
                    placeholder="2024"
                    className="max-w-xs"
                />
                {errors['detail.tahun_pengadaan'] && <p className="text-sm text-red-600">{errors['detail.tahun_pengadaan']}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Judul/Nama</Label>
                    <Input
                        value={(detail.judul_nama as string) ?? ''}
                        onChange={(e) => setDetail('judul_nama', e.target.value)}
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

            <div className="space-y-2">
                <Label>Kondisi</Label>
                <Input
                    value={(detail.kondisi as string) ?? ''}
                    onChange={(e) => setDetail('kondisi', e.target.value)}
                    placeholder="Opsional"
                    className="max-w-xs"
                />
            </div>
        </>
    );
}
