import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const HAK_TANAH_OPTIONS = [
    'Hak Pakai',
    'Hak Pengelolaan',
    'Hak Milik',
    'Hak Guna Bangunan',
    'Hak Guna Usaha',
    'Lainnya',
];

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detail: Record<string, any>;
    setDetail: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function KibAFields({ detail, setDetail, errors }: Props) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Luas (M2) *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={detail.luas_m2 ?? ''}
                        onChange={(e) => setDetail('luas_m2', e.target.value)}
                        placeholder="0.00"
                    />
                    {errors['detail.luas_m2'] && <p className="text-sm text-red-600">{errors['detail.luas_m2']}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Tahun Pengadaan *</Label>
                    <Input
                        type="number"
                        value={detail.tahun_pengadaan ?? ''}
                        onChange={(e) => setDetail('tahun_pengadaan', e.target.value)}
                        placeholder="2024"
                    />
                    {errors['detail.tahun_pengadaan'] && <p className="text-sm text-red-600">{errors['detail.tahun_pengadaan']}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Letak/Alamat *</Label>
                <Textarea
                    value={(detail.alamat as string) ?? ''}
                    onChange={(e) => setDetail('alamat', e.target.value)}
                    placeholder="Alamat lokasi tanah"
                    rows={2}
                />
                {errors['detail.alamat'] && <p className="text-sm text-red-600">{errors['detail.alamat']}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Hak Tanah</Label>
                    <Select value={(detail.hak_tanah as string) || ''} onValueChange={(v) => setDetail('hak_tanah', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih hak tanah" />
                        </SelectTrigger>
                        <SelectContent>
                            {HAK_TANAH_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors['detail.hak_tanah'] && <p className="text-sm text-red-600">{errors['detail.hak_tanah']}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Penggunaan</Label>
                    <Input
                        value={(detail.penggunaan as string) ?? ''}
                        onChange={(e) => setDetail('penggunaan', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Sertifikat - Tanggal</Label>
                    <Input
                        type="date"
                        value={(detail.sertifikat_tanggal as string) ?? ''}
                        onChange={(e) => setDetail('sertifikat_tanggal', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Sertifikat - Nomor</Label>
                    <Input
                        value={(detail.sertifikat_nomor as string) ?? ''}
                        onChange={(e) => setDetail('sertifikat_nomor', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>
        </>
    );
}
