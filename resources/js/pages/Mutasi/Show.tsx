import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AssetMutation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, ArrowRight, FileText, Paperclip } from 'lucide-react';

interface Props {
    mutation: AssetMutation;
}

function formatTanggal(tanggal: string) {
    return new Date(tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatUkuran(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MutasiShow({ mutation }: Props) {
    return (
        <AuthenticatedLayout header={`Pergeseran ${mutation.nomor_bast}`}>
            <Head title={`Pergeseran ${mutation.nomor_bast}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/mutasi">
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href={`/mutasi/${mutation.id}/bast`} target="_blank" rel="noreferrer">
                            <FileText className="mr-2 size-4" />
                            Cetak BAST
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rincian Pergeseran</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="rounded-md border px-3 py-2">
                                <p className="text-muted-foreground text-xs">Ruangan Asal</p>
                                <p className="font-medium">{mutation.ruangan_asal_nama}</p>
                                <p className="text-muted-foreground text-xs">{mutation.pj_asal_nama || '-'}</p>
                            </div>
                            <ArrowRight className="text-muted-foreground size-5" />
                            <div className="rounded-md border px-3 py-2">
                                <p className="text-muted-foreground text-xs">Ruangan Tujuan</p>
                                <p className="font-medium">{mutation.ruangan_tujuan_nama}</p>
                                <p className="text-muted-foreground text-xs">{mutation.pj_tujuan_nama || '-'}</p>
                            </div>
                        </div>

                        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground text-xs">Nomor BAST</dt>
                                <dd className="font-medium">{mutation.nomor_bast}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground text-xs">Tanggal</dt>
                                <dd className="font-medium">{formatTanggal(mutation.tanggal)}</dd>
                            </div>
                            {mutation.keterangan && (
                                <div className="sm:col-span-2">
                                    <dt className="text-muted-foreground text-xs">Keterangan</dt>
                                    <dd>{mutation.keterangan}</dd>
                                </div>
                            )}
                            {mutation.creator && (
                                <div>
                                    <dt className="text-muted-foreground text-xs">Diproses oleh</dt>
                                    <dd>{mutation.creator.name}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Barang ({mutation.items?.length ?? 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">No</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>Kode Barang</TableHead>
                                        <TableHead className="w-28">No. Register</TableHead>
                                        <TableHead>PJ Sebelumnya</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(mutation.items ?? []).map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {item.asset?.nama_barang ?? '(aset dihapus)'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {item.asset?.kode_barang ?? '-'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {item.asset?.nomor_register ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.pj_asal_nama || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dokumen BAST</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(mutation.documents ?? []).map((doc) => (
                            <a
                                key={doc.id}
                                href={`/mutasi/${mutation.id}/dokumen/${doc.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:bg-muted/50 flex items-center gap-3 rounded-md border p-3 text-sm"
                            >
                                <Paperclip className="text-muted-foreground size-4 shrink-0" />
                                <span className="flex-1 truncate">{doc.nama_asli}</span>
                                <span className="text-muted-foreground text-xs">{formatUkuran(doc.ukuran_bytes)}</span>
                            </a>
                        ))}
                        {(mutation.documents ?? []).length === 0 && (
                            <p className="text-muted-foreground text-sm">Tidak ada dokumen.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
