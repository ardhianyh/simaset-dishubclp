import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Ruangan, KibType } from '@/types';
import AssetForm from './Partials/AssetForm';
import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    kibType: KibType;
    kibLabel: string;
    ruangans: Ruangan[];
    asalUsulOptions: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DetailData = Record<string, any>;

interface FormData {
    nama_barang: string;
    kode_barang: string;
    nomor_register: string;
    ruangan_id: number | null;
    pj_nama: string;
    pj_nip: string;
    pj_telepon: string;
    pj_alamat: string;
    latitude: number | null;
    longitude: number | null;
    asal_usul: string;
    harga: string;
    keterangan: string;
    detail: DetailData;
}

function getDefaultDetail(kibType: KibType): DetailData {
    switch (kibType) {
        case 'A': return { luas_m2: '', tahun_pengadaan: '', alamat: '', hak_tanah: '', sertifikat_tanggal: '', sertifikat_nomor: '', penggunaan: '' };
        case 'B': return { merk_type: '', ukuran_cc: '', bahan: '', tahun_pembelian: '', nomor_pabrik: '', nomor_rangka: '', nomor_mesin: '', nomor_polisi: '', nomor_bpkb: '' };
        case 'C': return { kondisi: '', bertingkat: false, beton: false, luas_lantai_m2: '', alamat: '', dokumen_tanggal: '', dokumen_nomor: '', status_tanah: '', nomor_kode_tanah: '' };
        case 'D': return { konstruksi: '', panjang_km: '', lebar_m: '', luas_m2: '', alamat: '', dokumen_tanggal: '', dokumen_nomor: '', status_tanah: '', nomor_kode_tanah: '', kondisi: '' };
        case 'E': return { judul_pencipta: '', spesifikasi: '', asal_daerah: '', pencipta: '', bahan: '', jenis: '', ukuran: '', jumlah: 1, tahun_cetak: '' };
        case 'L': return { tahun_pengadaan: '', judul_nama: '', pencipta: '', spesifikasi: '', kondisi: '' };
    }
}

export default function AssetCreate({ kibType, kibLabel, ruangans, asalUsulOptions }: Props) {
    const kibSlug = `kib-${kibType.toLowerCase()}`;
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [data, setDataState] = useState<FormData>({
        nama_barang: '',
        kode_barang: '',
        nomor_register: '',
        ruangan_id: null,
        pj_nama: '',
        pj_nip: '',
        pj_telepon: '',
        pj_alamat: '',
        latitude: null,
        longitude: null,
        asal_usul: '',
        harga: '',
        keterangan: '',
        detail: getDefaultDetail(kibType),
    });

    function setData(key: string, value: unknown) {
        setDataState((prev) => ({ ...prev, [key]: value }));
    }

    function setDetail(key: string, value: unknown) {
        setDataState((prev) => ({
            ...prev,
            detail: { ...prev.detail, [key]: value },
        }));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        
        router.post(`/assets/${kibSlug}`, data as unknown as Record<string, string>, {
            onError: (errs) => {
                setProcessing(false);
                
                // Check if this is a validation error (has field keys) or server error
                const errorCount = Object.keys(errs).length;
                
                if (errorCount > 0 && Object.keys(errs).some(k => k.includes('.'))) {
                    // Validation errors - field-level errors
                    setErrors(errs);
                    toast.error(`Validasi gagal: ${errorCount} field memiliki error. Periksa kembali data yang diisi.`);
                } else if (errorCount === 0 || Object.keys(errs).includes('error')) {
                    // Server error - no specific field errors
                    toast.error('Terjadi kesalahan pada server. Mohon hubungi administrator.');
                    console.error('Server error:', errs);
                } else {
                    // Other validation errors
                    setErrors(errs);
                    toast.error(`Terjadi kesalahan. Periksa kembali data yang diisi.`);
                }
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
    }

    // Show toast when errors are detected
    useEffect(() => {
        const errorCount = Object.keys(errors).length;
        if (errorCount > 0) {
            console.error('Form validation errors:', errors);
        }
    }, [errors]);

    return (
        <AuthenticatedLayout header={`Tambah ${kibLabel}`}>
            <Head title={`Tambah ${kibLabel}`} />

            <AssetForm
                kibType={kibType}
                kibLabel={kibLabel}
                ruangans={ruangans}
                asalUsulOptions={asalUsulOptions}
                data={data}
                setData={setData}
                detail={data.detail}
                setDetail={setDetail}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
            />
        </AuthenticatedLayout>
    );
}
