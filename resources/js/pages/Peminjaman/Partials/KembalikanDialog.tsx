import { router } from '@inertiajs/react';
import { AssetLoan } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Undo2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { formatValidationErrors } from '@/utils/formatErrors';
import { formatWaktu, waktuSekarang } from '@/utils/waktu';

interface Props {
    loan: AssetLoan;
    namaBarang?: string;
}

export default function KembalikanDialog({ loan, namaBarang }: Props) {
    const [open, setOpen] = useState(false);
    const [dikembalikanPada, setDikembalikanPada] = useState('');
    const [catatan, setCatatan] = useState('');
    const [processing, setProcessing] = useState(false);

    function handleOpenChange(value: boolean) {
        setOpen(value);
        if (value) {
            setDikembalikanPada(waktuSekarang());
            setCatatan('');
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(
            `/peminjaman/${loan.id}/kembali`,
            { dikembalikan_pada: dikembalikanPada, catatan_kembali: catatan },
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
                onError: (errs) => toast.error(formatValidationErrors(errs)),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Undo2 className="mr-2 size-4" />
                    Kembalikan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Catat Pengembalian</DialogTitle>
                        <DialogDescription>
                            {namaBarang ?? loan.asset?.nama_barang} dipinjam {loan.peminjam_nama} ({loan.peminjam_ruangan_nama})
                            sejak {formatWaktu(loan.dipinjam_pada)}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label>Tanggal &amp; Waktu Dikembalikan *</Label>
                        <Input
                            type="datetime-local"
                            value={dikembalikanPada}
                            onChange={(e) => setDikembalikanPada(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Catatan</Label>
                        <Textarea
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Kondisi barang saat dikembalikan (opsional)"
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Pengembalian'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
