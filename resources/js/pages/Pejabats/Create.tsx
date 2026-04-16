import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormEvent } from 'react';

export default function PejabatCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        nip: '',
        jabatan: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/pejabats');
    }

    return (
        <AuthenticatedLayout header="Tambah Pejabat">
            <Head title="Tambah Pejabat" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>Tambah Data Pejabat</CardTitle>
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
