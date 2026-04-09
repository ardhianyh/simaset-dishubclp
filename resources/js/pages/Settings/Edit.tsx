import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FormEvent, useState } from 'react';

interface Props {
    settings: Record<string, string>;
}

export default function SettingsEdit({ settings }: Props) {
    const [data, setData] = useState(settings);
    const [processing, setProcessing] = useState(false);

    function handleChange(key: string, value: string) {
        setData((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.put('/settings', data, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout header="Pengaturan">
            <Head title="Pengaturan" />

            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Instansi</CardTitle>
                        <CardDescription>
                            Informasi instansi yang akan ditampilkan pada header export laporan KIB.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nama Instansi</Label>
                            <Input
                                value={data.instansi_nama}
                                onChange={(e) => handleChange('instansi_nama', e.target.value)}
                                placeholder="PEMERINTAH KABUPATEN ..."
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Provinsi</Label>
                                <Input
                                    value={data.instansi_provinsi}
                                    onChange={(e) => handleChange('instansi_provinsi', e.target.value)}
                                    placeholder="PROVINSI JAWA TENGAH"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kabupaten/Kota</Label>
                                <Input
                                    value={data.instansi_kabkota}
                                    onChange={(e) => handleChange('instansi_kabkota', e.target.value)}
                                    placeholder="PEMERINTAH KABUPATEN ..."
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Bidang</Label>
                                <Input
                                    value={data.instansi_bidang}
                                    onChange={(e) => handleChange('instansi_bidang', e.target.value)}
                                    placeholder="Bidang ..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit Organisasi</Label>
                                <Input
                                    value={data.instansi_unit}
                                    onChange={(e) => handleChange('instansi_unit', e.target.value)}
                                    placeholder="Dinas ..."
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Sub Unit Organisasi</Label>
                                <Input
                                    value={data.instansi_sub_unit}
                                    onChange={(e) => handleChange('instansi_sub_unit', e.target.value)}
                                    placeholder="Sub unit..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nomor Kode Lokasi</Label>
                                <Input
                                    value={data.instansi_kode_lokasi}
                                    onChange={(e) => handleChange('instansi_kode_lokasi', e.target.value)}
                                    placeholder="XX.XX.XX.XX.XX.XX.XX"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alamat & Kontak Instansi</CardTitle>
                        <CardDescription>
                            Informasi kontak yang akan ditampilkan pada kop surat Pakta Integritas dan BAST.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Alamat</Label>
                            <Input
                                value={data.instansi_alamat ?? ''}
                                onChange={(e) => handleChange('instansi_alamat', e.target.value)}
                                placeholder="Jalan MT. Haryono Nomor 29, Tegalreja, ..."
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Telepon</Label>
                                <Input
                                    value={data.instansi_telepon ?? ''}
                                    onChange={(e) => handleChange('instansi_telepon', e.target.value)}
                                    placeholder="(0282) 534725"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Faksimile</Label>
                                <Input
                                    value={data.instansi_fax ?? ''}
                                    onChange={(e) => handleChange('instansi_fax', e.target.value)}
                                    placeholder="(0282) 521881"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input
                                    value={data.instansi_website ?? ''}
                                    onChange={(e) => handleChange('instansi_website', e.target.value)}
                                    placeholder="www.dishub.cilacapkab.go.id"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={data.instansi_email ?? ''}
                                    onChange={(e) => handleChange('instansi_email', e.target.value)}
                                    placeholder="dishub@cilacapkab.go.id"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tanda Tangan Export</CardTitle>
                        <CardDescription>
                            Nama dan NIP yang akan muncul di footer tanda tangan laporan export KIB.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Kota</Label>
                            <Input
                                value={data.ttd_kota}
                                onChange={(e) => handleChange('ttd_kota', e.target.value)}
                                placeholder="Cilacap"
                                className="max-w-xs"
                            />
                        </div>

                        <Separator />

                        <p className="text-muted-foreground text-sm font-medium">Kepala Dinas</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nama Kepala Dinas</Label>
                                <Input
                                    value={data.ttd_kepala_nama}
                                    onChange={(e) => handleChange('ttd_kepala_nama', e.target.value)}
                                    placeholder="Nama lengkap"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>NIP Kepala Dinas</Label>
                                <Input
                                    value={data.ttd_kepala_nip}
                                    onChange={(e) => handleChange('ttd_kepala_nip', e.target.value)}
                                    placeholder="NIP"
                                />
                            </div>
                        </div>

                        <Separator />

                        <p className="text-muted-foreground text-sm font-medium">Petugas Pengurus Barang</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nama Pengurus Barang</Label>
                                <Input
                                    value={data.ttd_pengurus_nama}
                                    onChange={(e) => handleChange('ttd_pengurus_nama', e.target.value)}
                                    placeholder="Nama lengkap"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>NIP Pengurus Barang</Label>
                                <Input
                                    value={data.ttd_pengurus_nip}
                                    onChange={(e) => handleChange('ttd_pengurus_nip', e.target.value)}
                                    placeholder="NIP"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
            </form>
        </AuthenticatedLayout>
    );
}
