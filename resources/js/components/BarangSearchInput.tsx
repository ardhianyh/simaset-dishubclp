import AutocompleteInput from '@/components/AutocompleteInput';

export interface UsulanBarang {
    nama_barang: string;
    kode_barang: string;
    jumlah: number;
}

interface Props {
    value: string;
    onChange: (nilai: string) => void;
    /** Dipanggil saat sebuah barang dipilih, supaya nama & kode saling melengkapi. */
    onPick: (barang: UsulanBarang) => void;
    kibType: string;
    placeholder?: string;
    id?: string;
}

/** Isian nama/kode barang dengan usulan dari data aset yang sudah tercatat. */
export default function BarangSearchInput({
    value,
    onChange,
    onPick,
    kibType,
    placeholder,
    id,
}: Props) {
    return (
        <AutocompleteInput<UsulanBarang>
            id={id}
            value={value}
            onChange={onChange}
            onPick={onPick}
            placeholder={placeholder}
            fetchUrl={(q) =>
                `/api/barang/search?kib_type=${encodeURIComponent(kibType)}&q=${encodeURIComponent(q)}`
            }
            renderItem={(item) => ({
                judul: item.nama_barang,
                keterangan: `${item.kode_barang} · sudah dipakai ${item.jumlah}x`,
            })}
        />
    );
}
