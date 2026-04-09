import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function KibCFields({ detail, setDetail, errors }: Props) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Kondisi *</Label>
                    <Select value={(detail.kondisi as string) || ''} onValueChange={(v) => setDetail('kondisi', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih kondisi" />
                        </SelectTrigger>
                        <SelectContent>
                            {KONDISI_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors['detail.kondisi'] && <p className="text-sm text-red-600">{errors['detail.kondisi']}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Luas Lantai (M2)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={detail.luas_lantai_m2 ?? ''}
                        onChange={(e) => setDetail('luas_lantai_m2', e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="flex gap-6">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="bertingkat"
                        checked={!!detail.bertingkat}
                        onCheckedChange={(checked) => setDetail('bertingkat', checked === true)}
                    />
                    <Label htmlFor="bertingkat" className="cursor-pointer">Bangunan Bertingkat</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="beton"
                        checked={!!detail.beton}
                        onCheckedChange={(checked) => setDetail('beton', checked === true)}
                    />
                    <Label htmlFor="beton" className="cursor-pointer">Konstruksi Beton</Label>
                </div>
            </div>
            {errors['detail.bertingkat'] && <p className="text-sm text-red-600">{errors['detail.bertingkat']}</p>}
            {errors['detail.beton'] && <p className="text-sm text-red-600">{errors['detail.beton']}</p>}

            <div className="space-y-2">
                <Label>Letak/Lokasi Alamat *</Label>
                <Textarea
                    value={(detail.alamat as string) ?? ''}
                    onChange={(e) => setDetail('alamat', e.target.value)}
                    placeholder="Alamat lokasi gedung"
                    rows={2}
                />
                {errors['detail.alamat'] && <p className="text-sm text-red-600">{errors['detail.alamat']}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Dokumen Gedung - Tanggal</Label>
                    <Input
                        type="date"
                        value={(detail.dokumen_tanggal as string) ?? ''}
                        onChange={(e) => setDetail('dokumen_tanggal', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Dokumen Gedung - Nomor</Label>
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
        </>
    );
}
