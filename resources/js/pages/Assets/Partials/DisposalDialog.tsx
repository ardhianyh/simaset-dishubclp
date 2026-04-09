import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, X, Upload } from 'lucide-react';
import { Asset, DisposalJenis } from '@/types';

interface DisposalDoc {
    file: File | null;
    jenis_dokumen: string;
}

interface Props {
    asset: Asset;
    kibSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const JENIS_OPTIONS: { value: DisposalJenis; label: string }[] = [
    { value: 'dihapus', label: 'Dihapus/Dimusnahkan' },
    { value: 'dikembalikan', label: 'Dikembalikan' },
    { value: 'dihibahkan', label: 'Dihibahkan' },
];

const DOKUMEN_JENIS_OPTIONS = [
    'BA Penghapusan',
    'SK Bupati',
    'BA Serah Terima',
    'BA Hibah',
    'Surat Perintah',
    'Lainnya',
];

export default function DisposalDialog({ asset, kibSlug, open, onOpenChange }: Props) {
    const [jenis, setJenis] = useState<DisposalJenis | ''>('');
    const [alasan, setAlasan] = useState('');
    const [nomorSk, setNomorSk] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [dokumen, setDokumen] = useState<DisposalDoc[]>([{ file: null, jenis_dokumen: '' }]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function addDokumen() {
        setDokumen([...dokumen, { file: null, jenis_dokumen: '' }]);
    }

    function removeDokumen(index: number) {
        if (dokumen.length <= 1) return;
        setDokumen(dokumen.filter((_, i) => i !== index));
    }

    function updateDokumen(index: number, field: keyof DisposalDoc, value: File | string | null) {
        const updated = [...dokumen];
        updated[index] = { ...updated[index], [field]: value };
        setDokumen(updated);
    }

    function resetForm() {
        setJenis('');
        setAlasan('');
        setNomorSk('');
        setTanggal(new Date().toISOString().split('T')[0]);
        setDokumen([{ file: null, jenis_dokumen: '' }]);
        setErrors({});
    }

    function handleSubmit() {
        const newErrors: Record<string, string> = {};

        if (!jenis) newErrors.jenis = 'Jenis penghapusan wajib dipilih.';
        if (!tanggal) newErrors.tanggal = 'Tanggal wajib diisi.';

        const validDocs = dokumen.filter(d => d.file && d.jenis_dokumen);
        if (validDocs.length === 0) {
            newErrors.dokumen = 'Minimal 1 dokumen pendukung wajib diunggah.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();
        formData.append('jenis', jenis);
        formData.append('tanggal', tanggal);
        if (alasan) formData.append('alasan', alasan);
        if (nomorSk) formData.append('nomor_sk', nomorSk);

        validDocs.forEach((doc, i) => {
            formData.append(`dokumen[${i}][file]`, doc.file!);
            formData.append(`dokumen[${i}][jenis_dokumen]`, doc.jenis_dokumen);
        });

        setProcessing(true);
        router.post(`/assets/${kibSlug}/${asset.id}/dispose`, formData, {
            forceFormData: true,
            onSuccess: () => {
                resetForm();
                onOpenChange(false);
            },
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!processing) { onOpenChange(v); if (!v) resetForm(); } }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Penghapusan Aset</DialogTitle>
                    <DialogDescription>
                        Hapus aset "<strong>{asset.nama_barang}</strong>". Unggah dokumen pendukung untuk memproses penghapusan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="jenis">Jenis Penghapusan <span className="text-red-500">*</span></Label>
                        <Select value={jenis} onValueChange={(v) => { setJenis(v as DisposalJenis); setErrors(e => ({ ...e, jenis: '' })); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis penghapusan" />
                            </SelectTrigger>
                            <SelectContent>
                                {JENIS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.jenis && <p className="text-sm text-red-500">{errors.jenis}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tanggal">Tanggal Penghapusan <span className="text-red-500">*</span></Label>
                        <Input
                            id="tanggal"
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                        />
                        {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nomor_sk">Nomor SK/Surat</Label>
                        <Input
                            id="nomor_sk"
                            value={nomorSk}
                            onChange={(e) => setNomorSk(e.target.value)}
                            placeholder="Contoh: SK/123/2026"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alasan">Alasan/Keterangan</Label>
                        <Textarea
                            id="alasan"
                            value={alasan}
                            onChange={(e) => setAlasan(e.target.value)}
                            placeholder="Alasan penghapusan aset..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Dokumen Pendukung <span className="text-red-500">*</span></Label>
                            <Button type="button" variant="outline" size="sm" onClick={addDokumen}>
                                <Plus className="mr-1 size-3" />
                                Tambah
                            </Button>
                        </div>
                        {errors.dokumen && <p className="text-sm text-red-500">{errors.dokumen}</p>}

                        {dokumen.map((doc, i) => (
                            <div key={i} className="space-y-2 rounded-md border p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Dokumen {i + 1}</span>
                                    {dokumen.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="size-6" onClick={() => removeDokumen(i)}>
                                            <X className="size-3" />
                                        </Button>
                                    )}
                                </div>
                                <Select value={doc.jenis_dokumen} onValueChange={(v) => updateDokumen(i, 'jenis_dokumen', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Jenis dokumen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOKUMEN_JENIS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={(e) => updateDokumen(i, 'file', e.target.files?.[0] || null)}
                                        className="text-sm"
                                    />
                                </div>
                                {doc.file && (
                                    <p className="text-muted-foreground text-xs">
                                        {doc.file.name} ({(doc.file.size / 1024).toFixed(0)} KB)
                                    </p>
                                )}
                                {errors[`dokumen.${i}.file`] && <p className="text-sm text-red-500">{errors[`dokumen.${i}.file`]}</p>}
                                {errors[`dokumen.${i}.jenis_dokumen`] && <p className="text-sm text-red-500">{errors[`dokumen.${i}.jenis_dokumen`]}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={processing}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            <Trash2 className="mr-2 size-4" />
                            {processing ? 'Memproses...' : 'Hapus Aset'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
