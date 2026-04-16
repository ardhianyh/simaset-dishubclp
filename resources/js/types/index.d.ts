export interface User {
    id: number;
    name: string;
    nip?: string;
    email: string;
    email_verified_at?: string;
    role: 'admin' | 'staff';
    telepon?: string;
    is_active: boolean;
    wilayahs?: Wilayah[];
}

export interface Wilayah {
    id: number;
    nama: string;
    deskripsi?: string;
    users_count?: number;
    users?: User[];
    created_at?: string;
    updated_at?: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface ImportError {
    row: number;
    messages: string[];
}

export interface FlashMessages {
    success?: string;
    error?: string;
    import_errors?: ImportError[];
}

export type KibType = 'A' | 'B' | 'C' | 'D' | 'E' | 'L';

export interface Asset {
    id: number;
    kib_type: KibType;
    nama_barang: string;
    kode_barang: string;
    nomor_register: string;
    wilayah_id?: number;
    wilayah?: Wilayah;
    pj_nama: string;
    pj_nip?: string;
    pj_telepon?: string;
    pj_alamat?: string;
    latitude?: number;
    longitude?: number;
    asal_usul: string;
    harga: number;
    keterangan?: string;
    created_by?: number;
    updated_by?: number;
    deleted_at?: string;
    created_at?: string;
    updated_at?: string;
    // Detail relations (only one will be present based on kib_type)
    kib_a_detail?: KibADetail;
    kib_b_detail?: KibBDetail;
    kib_c_detail?: KibCDetail;
    kib_d_detail?: KibDDetail;
    kib_e_detail?: KibEDetail;
    kib_l_detail?: KibLDetail;
    // Relations
    documents?: AssetDocument[];
    creator?: { id: number; name: string };
    updater?: { id: number; name: string };
}

export interface AssetDocument {
    id: number;
    asset_id: number;
    jenis_dokumen: 'BAST' | 'Foto' | 'Sertifikat' | 'SK' | 'Lainnya';
    nama_asli: string;
    nama_file: string;
    path: string;
    ukuran_bytes: number;
    mime_type: string;
    uploaded_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface KibADetail {
    id: number;
    luas_m2: number;
    tahun_pengadaan: number;
    alamat: string;
    hak_tanah?: string;
    sertifikat_tanggal?: string;
    sertifikat_nomor?: string;
    penggunaan?: string;
}

export interface KibBDetail {
    id: number;
    merk_type?: string;
    ukuran_cc?: string;
    bahan?: string;
    tahun_pembelian: number;
    nomor_pabrik?: string;
    nomor_rangka?: string;
    nomor_mesin?: string;
    nomor_polisi?: string;
    nomor_bpkb?: string;
}

export interface KibCDetail {
    id: number;
    kondisi: string;
    bertingkat: boolean;
    beton: boolean;
    luas_lantai_m2?: number;
    alamat: string;
    dokumen_tanggal?: string;
    dokumen_nomor?: string;
    status_tanah?: string;
    nomor_kode_tanah?: string;
}

export interface KibDDetail {
    id: number;
    konstruksi?: string;
    panjang_km?: number;
    lebar_m?: number;
    luas_m2?: number;
    alamat: string;
    dokumen_tanggal?: string;
    dokumen_nomor?: string;
    status_tanah?: string;
    nomor_kode_tanah?: string;
    kondisi?: string;
}

export interface KibEDetail {
    id: number;
    judul_pencipta?: string;
    spesifikasi?: string;
    asal_daerah?: string;
    pencipta?: string;
    bahan?: string;
    jenis?: string;
    ukuran?: string;
    jumlah: number;
    tahun_cetak: number;
}

export interface KibLDetail {
    id: number;
    tahun_pengadaan: number;
    judul_nama?: string;
    pencipta?: string;
    spesifikasi?: string;
    kondisi?: string;
}

export type DisposalJenis = 'dihapus' | 'dikembalikan' | 'dihibahkan';

export interface AssetDisposal {
    id: number;
    asset_id: number;
    jenis: DisposalJenis;
    alasan?: string;
    nomor_sk?: string;
    tanggal: string;
    disposed_by?: number;
    disposer?: { id: number; name: string };
    documents?: AssetDisposalDocument[];
    created_at?: string;
    updated_at?: string;
}

export interface AssetDisposalDocument {
    id: number;
    disposal_id: number;
    jenis_dokumen: string;
    nama_asli: string;
    nama_file: string;
    path: string;
    ukuran_bytes: number;
    mime_type: string;
    uploaded_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Pejabat {
    id: number;
    nama: string;
    nip?: string;
    jabatan?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AssetGeneratedDocument {
    id: number;
    asset_id: number;
    jenis: 'pakta_integritas' | 'bast';
    path: string;
    filename: string;
    metadata?: Record<string, string>;
    generated_by?: number;
    created_at?: string;
    updated_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: FlashMessages;
};
