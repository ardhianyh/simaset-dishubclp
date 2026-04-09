import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Asset, Wilayah, KibType } from '@/types';
import AssetForm from './Partials/AssetForm';
import { FormEvent, useState } from 'react';

interface Props {
    asset: Asset;
    kibType: KibType;
    kibLabel: string;
    wilayahs: Wilayah[];
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

export default function AssetEdit({ asset, kibType, kibLabel, wilayahs, asalUsulOptions }: Props) {
    const kibSlug = `kib-${kibType.toLowerCase()}`;
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [data, setDataState] = useState({
        nama_barang: asset.nama_barang,
        kode_barang: asset.kode_barang,
        nomor_register: asset.nomor_register,
        wilayah_id: asset.wilayah_id ?? null,
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
        router.put(`/assets/${kibSlug}/${asset.id}`, data as unknown as Record<string, string>, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout header={`Edit ${kibLabel}`}>
            <Head title={`Edit ${kibLabel}`} />

            <AssetForm
                kibType={kibType}
                kibLabel={kibLabel}
                wilayahs={wilayahs}
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
