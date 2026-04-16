import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Pejabat } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormEvent } from 'react';

interface Props {
    pejabat: Pejabat;
}

export default function PejabatEdit({ pejabat }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nama: pejabat.nama,
        nip: pejabat.nip || '',
        jabatan: pejabat.jabatan || '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        put(`/pejabats/${pejabat.id}`);
    }

    return (
        <AuthenticatedLayout header="Edit Pejabat">
            <Head title="Edit Pejabat" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>Edit Data Pejabat</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Lengkap *</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                            {errors.nama && <p className="text-sm text-red-600">{errors.nama}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nip">NIP</Label>
                            <Input
                                id="nip"
                                value={data.nip}
                                onChange={(e) => setData('nip', e.target.value)}
                                placeholder="Opsional"
                            />
                            {errors.nip && <p className="text-sm text-red-600">{errors.nip}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jabatan">Jabatan</Label>
                            <Input
                                id="jabatan"
                                value={data.jabatan}
                                onChange={(e) => setData('jabatan', e.target.value)}
                                placeholder="Contoh: Kepala Dinas Perhubungan"
                            />
                            {errors.jabatan && <p className="text-sm text-red-600">{errors.jabatan}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/pejabats">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
