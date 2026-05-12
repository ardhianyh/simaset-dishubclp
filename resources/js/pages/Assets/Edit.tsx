import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Asset, Ruangan, KibType } from '@/types';
import AssetForm from './Partials/AssetForm';
import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatValidationErrors } from '@/utils/formatErrors';

interface Props {
    asset: Asset;
    kibType: KibType;
    kibLabel: string;
    ruangans: Ruangan[];
    asalUsulOptions: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DetailData = Record<string, any>;

function extractDetail(asset: Asset, kibType: KibType): DetailData {
    const detailKey = `kib_${kibType.toLowerCase()}_detail` as keyof Asset;
    const detail = asset[detailKey] as Record<string, unknown> | undefined;

    if (!detail) return {};

    const { id, asset_id, created_at, updated_at, ...rest } = detail;
    return rest;
}

export default function AssetEdit({ asset, kibType, kibLabel, ruangans, asalUsulOptions }: Props) {
    const kibSlug = `kib-${kibType.toLowerCase()}`;
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [data, setDataState] = useState({
        nama_barang: asset.nama_barang,
        kode_barang: asset.kode_barang,
        nomor_register: asset.nomor_register,
        ruangan_id: asset.ruangan_id ?? null,
        pj_nama: asset.pj_nama,
        pj_nip: asset.pj_nip ?? '',
        pj_telepon: asset.pj_telepon ?? '',
        pj_alamat: asset.pj_alamat ?? '',
        latitude: asset.latitude ?? null,
        longitude: asset.longitude ?? null,
        asal_usul: asset.asal_usul,
        harga: asset.harga,
        keterangan: asset.keterangan ?? '',
        detail: extractDetail(asset, kibType) as DetailData,
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
        
        router.put(`/assets/${kibSlug}/${asset.id}`, data as unknown as Record<string, string>, {
            onError: (errs) => {
                setProcessing(false);
                
                // Check if this is a validation error (has field keys) or server error
                const errorCount = Object.keys(errs).length;
                
                if (errorCount > 0 && Object.keys(errs).some(k => k.includes('.'))) {
                    // Validation errors - field-level errors
                    setErrors(errs);
                    const formattedErrors = formatValidationErrors(errs);
                    toast.error(formattedErrors);
                } else if (errorCount === 0 || Object.keys(errs).includes('error')) {
                    // Server error - no specific field errors
                    toast.error('Terjadi kesalahan pada server. Mohon hubungi administrator.');
                    console.error('Server error:', errs);
                } else {
                    // Other validation errors
                    setErrors(errs);
                    const formattedErrors = formatValidationErrors(errs);
                    toast.error(formattedErrors);
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
        <AuthenticatedLayout header={`Edit ${kibLabel}`}>
            <Head title={`Edit ${kibLabel}`} />

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
                isEdit
            />
        </AuthenticatedLayout>
    );
}
