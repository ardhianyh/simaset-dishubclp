import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-lg text-lg font-bold">
                        SA
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Simaset Dinas Perhubungan Cilacap</h1>
                        <p className="text-muted-foreground text-xs">Sistem Manajemen Aset</p>
                    </div>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
