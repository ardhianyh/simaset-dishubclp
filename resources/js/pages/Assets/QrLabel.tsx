import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Asset, KibType } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';

interface Props {
    asset: Asset;
    kibType: KibType;
    kibLabel: string;
    publicUrl: string;
}

export default function QrLabel({ asset, kibType, kibLabel, publicUrl }: Props) {
    const kibSlug = `kib-${kibType.toLowerCase()}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout header={`Cetak Label QR - ${asset.nama_barang}`}>
            <Head title={`Label QR - ${asset.nama_barang}`} />

            {/* Print styles */}
            <style>{`
                @media print {
                    /* Hide everything except the label */
                    body * {
                        visibility: hidden;
                    }
                    #qr-label, #qr-label * {
                        visibility: visible;
                    }
                    #qr-label {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    /* Reset background for print */
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between print:hidden">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/assets/${kibSlug}/${asset.id}`}>
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali
                        </Link>
                    </Button>
                    <Button size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 size-4" />
                        Cetak Label
                    </Button>
                </div>

                {/* Label preview */}
                <div className="flex justify-center">
                    <div
                        id="qr-label"
                        className="w-[320px] rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 print:rounded-none print:border-solid print:border-black"
                    >
                        <div className="text-center">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                Dinas Perhubungan Kab. Cilacap
                            </h3>
                            <div className="my-1 border-b border-gray-300" />
                        </div>

                        <div className="mt-4 flex justify-center">
                            <QRCode value={publicUrl} size={180} />
                        </div>

                        <div className="mt-4 space-y-1 text-center">
                            <p className="text-sm font-bold leading-tight text-gray-900">
                                {asset.nama_barang}
                            </p>
                            <p className="font-mono text-xs text-gray-700">
                                {asset.kode_barang}
                            </p>
                            <p className="text-xs text-gray-500">
                                {kibLabel}
                            </p>
                            {asset.wilayah && (
                                <p className="text-xs text-gray-500">
                                    {asset.wilayah.nama}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-muted-foreground text-center text-sm print:hidden">
                    Klik "Cetak Label" untuk mencetak label QR code ini, lalu tempelkan pada aset.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
