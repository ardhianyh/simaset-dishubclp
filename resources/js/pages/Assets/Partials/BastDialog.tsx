import { Asset, AssetGeneratedDocument, Pejabat } from '@/types';
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
import { FileText, Download, RotateCcw } from 'lucide-react';
import PejabatSearchSelect from '@/components/PejabatSearchSelect';

interface Props {
    asset: Asset;
    generatedDocument?: AssetGeneratedDocument | null;
}

export default function BastDialog({ asset, generatedDocument }: Props) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'existing' | 'form'>(generatedDocument ? 'existing' : 'form');
    const [nomorSurat, setNomorSurat] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [pihak1, setPihak1] = useState<Pejabat | null>(null);
    const [pihak1Nama, setPihak1Nama] = useState('');
    const [pihak1Jabatan, setPihak1Jabatan] = useState('');
    const [pihak1Nip, setPihak1Nip] = useState('');
    const [pihak1Peran, setPihak1Peran] = useState('Pengguna Barang');
    const [pihak2Nama, setPihak2Nama] = useState(asset.pj_nama || '');
    const [pihak2Jabatan, setPihak2Jabatan] = useState('');
    const [pihak2Nip, setPihak2Nip] = useState(asset.pj_nip || '');

    function handleSelectPihak1(pejabat: Pejabat) {
        setPihak1(pejabat);
        setPihak1Nama(pejabat.nama);
        setPihak1Jabatan(pejabat.jabatan || '');
        setPihak1Nip(pejabat.nip || '');
    }

    function handleClearPihak1() {
        setPihak1(null);
        setPihak1Nama('');
        setPihak1Jabatan('');
        setPihak1Nip('');
    }

    function handleDownloadExisting() {
        window.open(`/export/bast/${asset.id}?download=1`, '_blank');
    }

    function handleCetak() {
        const params = new URLSearchParams({
            nomor_surat: nomorSurat,
            tanggal,
            pihak1_nama: pihak1Nama,
            pihak1_jabatan: pihak1Jabatan,
            pihak1_nip: pihak1Nip,
            pihak1_peran: pihak1Peran,
            pihak2_nama: pihak2Nama,
            pihak2_jabatan: pihak2Jabatan,
            pihak2_nip: pihak2Nip,
        });
        window.open(`/export/bast/${asset.id}?${params.toString()}`, '_blank');
        setOpen(false);
    }

    function handleOpenChange(isOpen: boolean) {
        setOpen(isOpen);
        if (isOpen) {
            setMode(generatedDocument ? 'existing' : 'form');
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                        {mode === 'existing'
                            ? 'Dokumen BAST sudah pernah dicetak. Anda dapat mengunduh atau membuat ulang.'
                            : 'Isi data untuk Berita Acara Serah Terima barang inventaris.'}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'existing' ? (
                    <div className="space-y-4 py-2">
                        <div className="rounded-md border p-4">
                            <p className="text-sm font-medium">Dokumen BAST sudah tersedia</p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Dicetak pada {generatedDocument?.created_at ? new Date(generatedDocument.created_at).toLocaleString('id-ID') : '-'}
                            </p>
                            {generatedDocument?.metadata && (
                                <div className="mt-2 space-y-1 text-xs">
                                    <p>Pihak 1: {generatedDocument.metadata.pihak1_nama || '-'}</p>
                                    <p>Pihak 2: {generatedDocument.metadata.pihak2_nama || '-'}</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setMode('form')}>
                                <RotateCcw className="mr-2 size-4" />
                                Buat Ulang
                            </Button>
                            <Button onClick={handleDownloadExisting}>
                                <Download className="mr-2 size-4" />
                                Download PDF
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 py-2">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nomor Surat</Label>
                                    <div className="border-input focus-within:ring-ring flex h-10 w-full items-center rounded-md border bg-transparent px-3 text-sm shadow-sm transition-colors focus-within:ring-1">
                                        <span className="text-muted-foreground whitespace-nowrap">000.3.2/</span>
                                        <input
                                            value={nomorSurat}
                                            onChange={(e) => setNomorSurat(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="876"
                                            inputMode="numeric"
                                            className="placeholder:text-muted-foreground w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-center outline-none focus:ring-0"
                                        />
                                        <span className="text-muted-foreground whitespace-nowrap">/21/{new Date(tanggal).getFullYear() || new Date().getFullYear()}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <Input
                                        type="date"
                                        value={tanggal}
                                        onChange={(e) => setTanggal(e.target.value)}
                                        className="[&::-webkit-datetime-edit]:flex-1"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <p className="text-muted-foreground text-sm font-medium">Pihak Pertama (yang menyerahkan)</p>
                                <div className="space-y-2">
                                    <Label>Pilih Pejabat</Label>
                                    <PejabatSearchSelect
                                        selected={pihak1}
                                        onSelect={handleSelectPihak1}
                                        onClear={handleClearPihak1}
                                    />
                                </div>
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
                                <div className="space-y-2">
                                    <Label>Peran</Label>
                                    <Input
                                        value={pihak1Peran}
                                        onChange={(e) => setPihak1Peran(e.target.value)}
                                        placeholder="Pengguna Barang"
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Muncul di kalimat: "{pihak1Jabatan || '[Jabatan]'} selaku <strong>{pihak1Peran || 'Pengguna Barang'}</strong> Milik Daerah..."
                                    </p>
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
