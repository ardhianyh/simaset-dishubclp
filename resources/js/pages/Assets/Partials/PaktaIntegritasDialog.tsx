import { Asset, AssetGeneratedDocument, Pejabat } from '@/types';
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
import { FileText, Download, RotateCcw } from 'lucide-react';
import PejabatSearchSelect from '@/components/PejabatSearchSelect';

interface Props {
    asset: Asset;
    generatedDocument?: AssetGeneratedDocument | null;
}

export default function PaktaIntegritasDialog({ asset, generatedDocument }: Props) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'existing' | 'form'>(generatedDocument ? 'existing' : 'form');
    const [selectedPejabat, setSelectedPejabat] = useState<Pejabat | null>(null);
    const [nama, setNama] = useState(asset.pj_nama || '');
    const [nip, setNip] = useState(asset.pj_nip || '');
    const [jabatan, setJabatan] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

    function handleSelectPejabat(pejabat: Pejabat) {
        setSelectedPejabat(pejabat);
        setNama(pejabat.nama);
        setNip(pejabat.nip || '');
        setJabatan(pejabat.jabatan || '');
    }

    function handleClearPejabat() {
        setSelectedPejabat(null);
        setNama(asset.pj_nama || '');
        setNip(asset.pj_nip || '');
        setJabatan('');
    }

    function handleDownloadExisting() {
        window.open(`/export/pakta-integritas/${asset.id}?download=1`, '_blank');
    }

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
                    Cetak Pakta Integritas
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cetak Pakta Integritas</DialogTitle>
                    <DialogDescription>
                        {mode === 'existing'
                            ? 'Dokumen Pakta Integritas sudah pernah dicetak. Anda dapat mengunduh atau membuat ulang.'
                            : 'Isi data penanda tangan untuk dokumen Pakta Integritas.'}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'existing' ? (
                    <div className="space-y-4 py-2">
                        <div className="rounded-md border p-4">
                            <p className="text-sm font-medium">Dokumen Pakta Integritas sudah tersedia</p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Dicetak pada {generatedDocument?.created_at ? new Date(generatedDocument.created_at).toLocaleString('id-ID') : '-'}
                            </p>
                            {generatedDocument?.metadata && (
                                <div className="mt-2 space-y-1 text-xs">
                                    <p>Nama: {generatedDocument.metadata.nama || '-'}</p>
                                    <p>Jabatan: {generatedDocument.metadata.jabatan || '-'}</p>
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
                            <div className="space-y-2">
                                <Label>Pilih Pejabat</Label>
                                <PejabatSearchSelect
                                    selected={selectedPejabat}
                                    onSelect={handleSelectPejabat}
                                    onClear={handleClearPejabat}
                                />
                            </div>
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
