import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Pejabat } from '@/types';
import { Search, X } from 'lucide-react';

interface Props {
    onSelect: (pejabat: Pejabat) => void;
    selected?: Pejabat | null;
    onClear?: () => void;
}

export default function PejabatSearchSelect({ onSelect, selected, onClear }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Pejabat[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length < 1) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/pejabats/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
                setIsOpen(true);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    if (selected) {
        return (
            <div className="flex items-center gap-2 rounded-md border p-2.5">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{selected.nama}</p>
                    <p className="text-muted-foreground text-xs">
                        {[selected.jabatan, selected.nip].filter(Boolean).join(' - ') || 'Tidak ada jabatan/NIP'}
                    </p>
                </div>
                {onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder="Cari pejabat (nama, NIP, jabatan)..."
                    className="pl-9"
                />
            </div>
            {isOpen && (
                <div className="bg-popover absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
                    {loading ? (
                        <div className="text-muted-foreground p-3 text-center text-sm">Mencari...</div>
                    ) : results.length === 0 ? (
                        <div className="text-muted-foreground p-3 text-center text-sm">Tidak ditemukan</div>
                    ) : (
                        results.map((pejabat) => (
                            <button
                                key={pejabat.id}
                                type="button"
                                className="hover:bg-accent w-full px-3 py-2 text-left"
                                onClick={() => {
                                    onSelect(pejabat);
                                    setQuery('');
                                    setIsOpen(false);
                                }}
                            >
                                <p className="text-sm font-medium">{pejabat.nama}</p>
                                <p className="text-muted-foreground text-xs">
                                    {[pejabat.jabatan, pejabat.nip].filter(Boolean).join(' - ')}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
