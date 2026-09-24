const NAMA_BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Waktu sekarang dalam format isian `datetime-local` ("YYYY-MM-DDTHH:mm"), zona waktu komputer pengguna. */
export function waktuSekarang(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * "2026-09-24 14:30" -> "24 September 2026, 14.30".
 * Diurai manual (bukan lewat Date) karena waktu peminjaman disimpan tanpa zona waktu.
 */
export function formatWaktu(waktu?: string | null): string {
    if (!waktu) return '-';
    const [tanggal, jam = ''] = waktu.replace('T', ' ').split(' ');
    const [y, m, d] = tanggal.split('-');
    const bagianJam = jam.slice(0, 5).replace(':', '.');
    return `${Number(d)} ${NAMA_BULAN[Number(m) - 1]} ${y}${bagianJam ? `, ${bagianJam}` : ''}`;
}

/** Peminjaman aktif yang sudah melewati rencana kembali. */
export function terlambat(rencanaKembali?: string | null, dikembalikanPada?: string | null): boolean {
    if (!rencanaKembali || dikembalikanPada) return false;
    return rencanaKembali.replace(' ', 'T') < waktuSekarang();
}
