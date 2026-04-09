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

const KONDISI_OPTIONS = ['Baik', 'Kurang Baik', 'Rusak Berat'];
const STATUS_TANAH_OPTIONS = ['Tanah Milik Pemda', 'Tanah Milik Negara', 'Tanah Milik Provinsi', 'Lainnya'];

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detail: Record<string, any>;
    setDetail: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function KibDFields({ detail, setDetail, errors }: Props) {
    return (
        <>
            <div className="space-y-2">
                <Label>Konstruksi</Label>
                <Input
                    value={(detail.konstruksi as string) ?? ''}
                    onChange={(e) => setDetail('konstruksi', e.target.value)}
                    placeholder="Jenis konstruksi (opsional)"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label>Panjang (Km)</Label>
                    <Input
                        type="number"
                        step="0.001"
                        value={detail.panjang_km ?? ''}
                        onChange={(e) => setDetail('panjang_km', e.target.value)}
                        placeholder="0.000"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Lebar (M)</Label>
                    <Input
                        type="number"
                        step="0.001"
                        value={detail.lebar_m ?? ''}
                        onChange={(e) => setDetail('lebar_m', e.target.value)}
                        placeholder="0.000"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Luas (M2)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={detail.luas_m2 ?? ''}
                        onChange={(e) => setDetail('luas_m2', e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Letak/Lokasi Alamat *</Label>
                <Textarea
                    value={(detail.alamat as string) ?? ''}
                    onChange={(e) => setDetail('alamat', e.target.value)}
                    placeholder="Alamat lokasi"
                    rows={2}
                />
                {errors['detail.alamat'] && <p className="text-sm text-red-600">{errors['detail.alamat']}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Dokumen - Tanggal</Label>
                    <Input
                        type="date"
                        value={(detail.dokumen_tanggal as string) ?? ''}
                        onChange={(e) => setDetail('dokumen_tanggal', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Dokumen - Nomor</Label>
                    <Input
                        value={(detail.dokumen_nomor as string) ?? ''}
                        onChange={(e) => setDetail('dokumen_nomor', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Status Tanah</Label>
                    <Select value={(detail.status_tanah as string) || ''} onValueChange={(v) => setDetail('status_tanah', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status tanah" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_TANAH_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Nomor Kode Tanah</Label>
                    <Input
                        value={(detail.nomor_kode_tanah as string) ?? ''}
                        onChange={(e) => setDetail('nomor_kode_tanah', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Kondisi</Label>
                <Select value={(detail.kondisi as string) || ''} onValueChange={(v) => setDetail('kondisi', v)}>
                    <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                        {KONDISI_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    );
}
