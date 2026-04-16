import { Asset, AssetDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Camera, ImagePlus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DragEvent, useCallback, useRef, useState } from 'react';

interface Props {
    asset: Asset;
    kibSlug: string;
}

function formatFileSize(bytes: number): string {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
}

export default function PhotoSection({ asset, kibSlug }: Props) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const photos = (asset.documents || []).filter(
        (doc) => doc.jenis_dokumen === 'Foto' && doc.mime_type.startsWith('image/')
    );

    const uploadFiles = useCallback(
        (files: FileList | File[]) => {
            const imageFiles = Array.from(files).filter((f) =>
                ['image/jpeg', 'image/png'].includes(f.type)
            );
            if (imageFiles.length === 0) return;

            const formData = new FormData();
            imageFiles.forEach((file) => formData.append('photos[]', file));

            setUploading(true);
            router.post(`/assets/${kibSlug}/${asset.id}/photos`, formData, {
                forceFormData: true,
                onFinish: () => {
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            });
        },
        [kibSlug, asset.id]
    );

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        setDragOver(false);
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
        }
    }

    function handleDelete(docId: number) {
        router.delete(`/assets/${kibSlug}/${asset.id}/documents/${docId}`, {
            preserveScroll: true,
        });
    }

    function navigatePreview(direction: -1 | 1) {
        if (previewIndex === null) return;
        const next = previewIndex + direction;
        if (next >= 0 && next < photos.length) {
            setPreviewIndex(next);
        }
    }

    const previewPhoto = previewIndex !== null ? photos[previewIndex] : null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Camera className="size-4" />
                    Foto Aset
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
                        dragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <ImagePlus className="text-muted-foreground mb-2 size-8" />
                    <p className="text-muted-foreground text-sm font-medium">
                        {uploading
                            ? 'Mengupload foto...'
                            : 'Klik atau seret foto ke sini'}
                    </p>
                    <p className="text-muted-foreground/70 mt-1 text-xs">
                        JPG, PNG — Maks. 1 MB per file — Maks. 20 foto sekaligus
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                uploadFiles(e.target.files);
                            }
                        }}
                    />
                </div>

                {/* Photo grid */}
                {photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                            >
                                <img
                                    src={`/assets/${kibSlug}/${asset.id}/documents/${photo.id}`}
                                    alt={photo.nama_asli}
                                    className="size-full cursor-pointer object-cover transition-transform group-hover:scale-105"
                                    onClick={() => setPreviewIndex(index)}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <p className="truncate text-xs text-white">
                                        {photo.nama_asli}
                                    </p>
                                    <p className="text-xs text-white/70">
                                        {formatFileSize(photo.ukuran_bytes)}
                                    </p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 size-7 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Hapus Foto</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Hapus foto "{photo.nama_asli}"? Tindakan ini tidak dapat dibatalkan.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(photo.id)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Hapus
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                        Belum ada foto aset.
                    </p>
                )}
            </CardContent>

            {/* Lightbox preview */}
            <Dialog
                open={previewIndex !== null}
                onOpenChange={(open) => !open && setPreviewIndex(null)}
            >
                <DialogContent className="max-h-[95vh] max-w-5xl overflow-hidden p-0">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle className="flex items-center justify-between pr-8">
                            <span className="truncate">{previewPhoto?.nama_asli}</span>
                            <span className="text-muted-foreground shrink-0 text-sm font-normal">
                                {previewIndex !== null
                                    ? `${previewIndex + 1} / ${photos.length}`
                                    : ''}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    {previewPhoto && (
                        <div className="relative flex items-center justify-center px-6 pb-6">
                            {photos.length > 1 && previewIndex !== null && previewIndex > 0 && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute left-8 z-10 size-10 rounded-full"
                                    onClick={() => navigatePreview(-1)}
                                >
                                    <ChevronLeft className="size-5" />
                                </Button>
                            )}
                            <img
                                src={`/assets/${kibSlug}/${asset.id}/documents/${previewPhoto.id}`}
                                alt={previewPhoto.nama_asli}
                                className="max-h-[75vh] rounded-md object-contain"
                            />
                            {photos.length > 1 &&
                                previewIndex !== null &&
                                previewIndex < photos.length - 1 && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute right-8 z-10 size-10 rounded-full"
                                        onClick={() => navigatePreview(1)}
                                    >
                                        <ChevronRight className="size-5" />
                                    </Button>
                                )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
