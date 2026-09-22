import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface Props<T> {
    value: string;
    onChange: (nilai: string) => void;
    /** Dipanggil saat sebuah usulan dipilih, untuk mengisi field pasangannya. */
    onPick: (item: T) => void;
    /** URL pencarian untuk kata kunci yang diketik. */
    fetchUrl: (q: string) => string;
    renderItem: (item: T) => { judul: string; keterangan?: string };
    placeholder?: string;
    id?: string;
    minLength?: number;
}

/**
 * Isian teks dengan usulan otomatis dari server.
 * Tetap bisa diketik bebas kalau datanya belum ada di sistem.
 */
export default function AutocompleteInput<T>({
    value,
    onChange,
    onPick,
    fetchUrl,
    renderItem,
    placeholder,
    id,
    minLength = 2,
}: Props<T>) {
    const [usulan, setUsulan] = useState<T[]>([]);
    const [terbuka, setTerbuka] = useState(false);
    const [memuat, setMemuat] = useState(false);
    const wadahRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const abaikanRef = useRef(false);

    useEffect(() => {
        function klikLuar(e: MouseEvent) {
            if (wadahRef.current && !wadahRef.current.contains(e.target as Node)) {
                setTerbuka(false);
            }
        }
        document.addEventListener('mousedown', klikLuar);
        return () => document.removeEventListener('mousedown', klikLuar);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (abaikanRef.current) {
            abaikanRef.current = false;
            return;
        }

        const q = value.trim();
        if (q.length < minLength) {
            setUsulan([]);
            setTerbuka(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setMemuat(true);
            try {
                const res = await fetch(fetchUrl(q));
                const data: T[] = await res.json();
                setUsulan(data);
                setTerbuka(data.length > 0);
            } catch {
                setUsulan([]);
                setTerbuka(false);
            } finally {
                setMemuat(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    function pilih(item: T) {
        abaikanRef.current = true;
        onPick(item);
        setTerbuka(false);
        setUsulan([]);
    }

    return (
        <div ref={wadahRef} className="relative">
            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => usulan.length > 0 && setTerbuka(true)}
                placeholder={placeholder}
                autoComplete="off"
            />
            {terbuka && (
                <div className="bg-popover absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border shadow-md">
                    {memuat ? (
                        <div className="text-muted-foreground p-3 text-center text-sm">Mencari...</div>
                    ) : (
                        usulan.map((item, index) => {
                            const { judul, keterangan } = renderItem(item);

                            return (
                                <button
                                    key={`${judul}-${index}`}
                                    type="button"
                                    className="hover:bg-accent w-full px-3 py-2 text-left"
                                    onClick={() => pilih(item)}
                                >
                                    <p className="text-sm font-medium">{judul}</p>
                                    {keterangan && (
                                        <p className="text-muted-foreground text-xs">{keterangan}</p>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
