import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detail: Record<string, any>;
    setDetail: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function KibBFields({ detail, setDetail, errors }: Props) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label>Merk/Type</Label>
                    <Input
                        value={(detail.merk_type as string) ?? ''}
                        onChange={(e) => setDetail('merk_type', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Ukuran/CC</Label>
                    <Input
                        value={(detail.ukuran_cc as string) ?? ''}
                        onChange={(e) => setDetail('ukuran_cc', e.target.value)}
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

            <div className="space-y-2">
                <Label>Tahun Pembelian *</Label>
                <Input
                    type="number"
                    value={detail.tahun_pembelian ?? ''}
                    onChange={(e) => setDetail('tahun_pembelian', e.target.value)}
                    placeholder="2024"
                    className="max-w-xs"
                />
                {errors['detail.tahun_pembelian'] && <p className="text-sm text-red-600">{errors['detail.tahun_pembelian']}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Nomor Pabrik</Label>
                    <Input
                        value={(detail.nomor_pabrik as string) ?? ''}
                        onChange={(e) => setDetail('nomor_pabrik', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nomor Rangka</Label>
                    <Input
                        value={(detail.nomor_rangka as string) ?? ''}
                        onChange={(e) => setDetail('nomor_rangka', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label>Nomor Mesin</Label>
                    <Input
                        value={(detail.nomor_mesin as string) ?? ''}
                        onChange={(e) => setDetail('nomor_mesin', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nomor Polisi</Label>
                    <Input
                        value={(detail.nomor_polisi as string) ?? ''}
                        onChange={(e) => setDetail('nomor_polisi', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nomor BPKB</Label>
                    <Input
                        value={(detail.nomor_bpkb as string) ?? ''}
                        onChange={(e) => setDetail('nomor_bpkb', e.target.value)}
                        placeholder="Opsional"
                    />
                </div>
            </div>
        </>
    );
}
