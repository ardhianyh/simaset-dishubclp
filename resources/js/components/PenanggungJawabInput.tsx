import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface Usulan {
    nama: string;
    nip?: string | null;
    jabatan?: string | null;
}

interface Props {
    value: string;
    onChange: (nama: string) => void;
    /** Dipanggil saat sebuah nama dipilih, supaya NIP ikut terisi. */
    onPick: (usulan: Usulan) => void;
    placeholder?: string;
    id?: string;
}

/**
 * Isian nama penanggung jawab dengan usulan otomatis.
 * Tetap bisa diketik bebas kalau namanya belum ada di sistem.
 */
export default function PenanggungJawabInput({
    value,
    onChange,
    onPick,
    placeholder = 'Nama lengkap',
    id,
}: Props) {
    const [usulan, setUsulan] = useState<Usulan[]>([]);
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
        if (q.length < 2) {
            setUsulan([]);
            setTerbuka(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setMemuat(true);
            try {
                const res = await fetch(`/api/penanggung-jawab/search?q=${encodeURIComponent(q)}`);
                const data: Usulan[] = await res.json();
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
    }, [value]);

    function pilih(item: Usulan) {
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
                        usulan.map((item, index) => (
                            <button
                                key={`${item.nama}-${index}`}
                                type="button"
                                className="hover:bg-accent w-full px-3 py-2 text-left"
                                onClick={() => pilih(item)}
                            >
                                <p className="text-sm font-medium">{item.nama}</p>
                                <p className="text-muted-foreground text-xs">
                                    {[item.jabatan, item.nip].filter(Boolean).join(' · ') || 'Tanpa NIP'}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
