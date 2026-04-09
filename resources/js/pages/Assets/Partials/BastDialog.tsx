import { Asset } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

export default function BastDialog({ asset }: Props) {
    const [open, setOpen] = useState(false);
    const [nomorSurat, setNomorSurat] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [pihak1Nama, setPihak1Nama] = useState('');
    const [pihak1Jabatan, setPihak1Jabatan] = useState('');
    const [pihak1Nip, setPihak1Nip] = useState('');
    const [pihak2Nama, setPihak2Nama] = useState(asset.pj_nama || '');
    const [pihak2Jabatan, setPihak2Jabatan] = useState('');
    const [pihak2Nip, setPihak2Nip] = useState(asset.pj_nip || '');

    function handleCetak() {
        const params = new URLSearchParams({
            nomor_surat: nomorSurat,
            tanggal,
            pihak1_nama: pihak1Nama,
            pihak1_jabatan: pihak1Jabatan,
            pihak1_nip: pihak1Nip,
            pihak2_nama: pihak2Nama,
            pihak2_jabatan: pihak2Jabatan,
            pihak2_nip: pihak2Nip,
        });
        window.open(`/export/bast/${asset.id}?${params.toString()}`, '_blank');
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FileText className="mr-2 size-4" />
                    Cetak BAST
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cetak BAST</DialogTitle>
                    <DialogDescription>
                        Isi data untuk Berita Acara Serah Terima barang inventaris.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Nomor Surat</Label>
                            <Input
                                value={nomorSurat}
                                onChange={(e) => setNomorSurat(e.target.value)}
                                placeholder="000.2.3.2/..."
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

                    <Separator />

                    <p className="text-muted-foreground text-sm font-medium">Pihak Pertama (yang menyerahkan)</p>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Nama</Label>
                            <Input
                                value={pihak1Nama}
                                onChange={(e) => setPihak1Nama(e.target.value)}
                                placeholder="Nama Kepala Dinas"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Jabatan</Label>
                                <Input
                                    value={pihak1Jabatan}
                                    onChange={(e) => setPihak1Jabatan(e.target.value)}
                                    placeholder="Kepala Dinas ..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>NIP</Label>
                                <Input
                                    value={pihak1Nip}
                                    onChange={(e) => setPihak1Nip(e.target.value)}
                                    placeholder="NIP"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <p className="text-muted-foreground text-sm font-medium">Pihak Kedua (yang menerima)</p>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Nama</Label>
                            <Input
                                value={pihak2Nama}
                                onChange={(e) => setPihak2Nama(e.target.value)}
                                placeholder="Nama penerima"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Jabatan</Label>
                                <Input
                                    value={pihak2Jabatan}
                                    onChange={(e) => setPihak2Jabatan(e.target.value)}
                                    placeholder="Jabatan penerima"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>NIP</Label>
                                <Input
                                    value={pihak2Nip}
                                    onChange={(e) => setPihak2Nip(e.target.value)}
                                    placeholder="NIP"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleCetak} disabled={!pihak1Nama || !pihak2Nama}>
                        Cetak PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
