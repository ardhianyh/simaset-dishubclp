import { Asset } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { FileText } from 'lucide-react';

interface Props {
    asset: Asset;
}

export default function PaktaIntegritasDialog({ asset }: Props) {
    const [open, setOpen] = useState(false);
    const [nama, setNama] = useState(asset.pj_nama || '');
    const [nip, setNip] = useState(asset.pj_nip || '');
    const [jabatan, setJabatan] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

    function handleCetak() {
        const params = new URLSearchParams({
            nama,
            nip,
            jabatan,
            tanggal,
        });
        window.open(`/export/pakta-integritas/${asset.id}?${params.toString()}`, '_blank');
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FileText className="mr-2 size-4" />
                    Cetak Pakta Integritas
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cetak Pakta Integritas</DialogTitle>
                    <DialogDescription>
                        Isi data penanda tangan untuk dokumen Pakta Integritas.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Nama lengkap"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>NIP</Label>
                        <Input
                            value={nip}
                            onChange={(e) => setNip(e.target.value)}
                            placeholder="NIP"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Jabatan</Label>
                        <Input
                            value={jabatan}
                            onChange={(e) => setJabatan(e.target.value)}
                            placeholder="Contoh: Kepala Seksi Sarana"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tanggal</Label>
                        <Input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleCetak} disabled={!nama}>
                        Cetak PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
