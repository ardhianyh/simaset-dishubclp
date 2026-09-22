import AutocompleteInput from '@/components/AutocompleteInput';

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

/** Isian nama penanggung jawab dengan usulan dari master pejabat, PJ ruangan, dan PJ aset. */
export default function PenanggungJawabInput({
    value,
    onChange,
    onPick,
    placeholder = 'Nama lengkap',
    id,
}: Props) {
    return (
        <AutocompleteInput<Usulan>
            id={id}
            value={value}
            onChange={onChange}
            onPick={onPick}
            placeholder={placeholder}
            fetchUrl={(q) => `/api/penanggung-jawab/search?q=${encodeURIComponent(q)}`}
            renderItem={(item) => ({
                judul: item.nama,
                keterangan: [item.jabatan, item.nip].filter(Boolean).join(' · ') || 'Tanpa NIP',
            })}
        />
    );
}
