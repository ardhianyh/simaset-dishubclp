import { Asset, AssetDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Upload, Download, Trash2, FileText, Image, File, Eye } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

interface Props {
    asset: Asset;
    kibSlug: string;
    jenisOptions: string[];
}

function formatFileSize(bytes: number): string {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
}

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    return File;
}

function getJenisBadgeVariant(jenis: string): 'default' | 'secondary' | 'outline' {
    switch (jenis) {
        case 'BAST': return 'default';
        case 'Sertifikat': return 'default';
        case 'SK': return 'secondary';
        default: return 'outline';
    }
}

export default function DocumentSection({ asset, kibSlug, jenisOptions }: Props) {
    const [uploading, setUploading] = useState(false);
    const [jenisDokumen, setJenisDokumen] = useState('');
    const [previewDoc, setPreviewDoc] = useState<AssetDocument | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const documents = asset.documents || [];

    function canPreview(mimeType: string) {
        return mimeType.startsWith('image/') || mimeType === 'application/pdf';
    }

    function handleUpload(e: FormEvent) {
        e.preventDefault();
        const file = fileInputRef.current?.files?.[0];
        if (!file || !jenisDokumen) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('jenis_dokumen', jenisDokumen);

        setUploading(true);
        router.post(`/assets/${kibSlug}/${asset.id}/documents`, formData, {
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                setJenisDokumen('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    }

    function handleDelete(docId: number) {
        router.delete(`/assets/${kibSlug}/${asset.id}/documents/${docId}`, {
            preserveScroll: true,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Dokumen Pendukung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleUpload} className="flex items-end gap-3">
                    <div className="space-y-2">
                        <Label>Jenis Dokumen</Label>
                        <Select value={jenisDokumen} onValueChange={setJenisDokumen}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                {jenisOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label>File</Label>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                    </div>
                    <Button type="submit" disabled={uploading || !jenisDokumen} size="sm">
                        <Upload className="mr-2 size-4" />
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </form>

                {documents.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama File</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Ukuran</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="w-24 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => {
                                    const Icon = getFileIcon(doc.mime_type);
                                    return (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="text-muted-foreground size-4 shrink-0" />
                                                    <span className="max-w-[200px] truncate text-sm">
                                                        {doc.nama_asli}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getJenisBadgeVariant(doc.jenis_dokumen)}>
                                                    {doc.jenis_dokumen}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatFileSize(doc.ukuran_bytes)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {canPreview(doc.mime_type) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={() => setPreviewDoc(doc)}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="size-8" asChild>
                                                        <a href={`/assets/${kibSlug}/${asset.id}/documents/${doc.id}?download`}>
                                                            <Download className="size-4" />
                                                        </a>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:text-red-700">
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Hapus file "{doc.nama_asli}"? Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(doc.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                        Belum ada dokumen pendukung.
                    </p>
                )}
            </CardContent>

            <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{previewDoc?.nama_asli}</DialogTitle>
                    </DialogHeader>
                    {previewDoc && (
                        <div className="flex items-center justify-center">
                            {previewDoc.mime_type.startsWith('image/') ? (
                                <img
                                    src={`/assets/${kibSlug}/${asset.id}/documents/${previewDoc.id}`}
                                    alt={previewDoc.nama_asli}
                                    className="max-h-[70vh] rounded-md object-contain"
                                />
                            ) : previewDoc.mime_type === 'application/pdf' ? (
                                <iframe
                                    src={`/assets/${kibSlug}/${asset.id}/documents/${previewDoc.id}`}
                                    className="h-[70vh] w-full rounded-md"
                                    title={previewDoc.nama_asli}
                                />
                            ) : null}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
