/**
 * Format field name from validation key
 * e.g., "detail.tahun_pembelian" -> "Tahun Pembelian"
 * e.g., "nama_barang" -> "Nama Barang"
 */
function formatFieldName(fieldKey: string): string {
    // Remove 'detail.' prefix if exists
    let field = fieldKey.replace(/^detail\./, '');
    
    // Split by underscore and capitalize each word
    return field
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Truncate error message to reasonable length
 */
function truncateMessage(message: string, maxLength: number = 80): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
}

/**
 * Format validation errors for user display
 * Returns formatted string with field names and error messages
 */
export function formatValidationErrors(errors: Record<string, string>): string {
    if (Object.keys(errors).length === 0) {
        return 'Terjadi kesalahan validasi. Periksa kembali data yang diisi.';
    }

    const errorEntries = Object.entries(errors)
        .slice(0, 3) // Limit to first 3 errors
        .map(([fieldKey, message]) => {
            const fieldName = formatFieldName(fieldKey);
            const truncatedMsg = truncateMessage(message);
            return `• ${fieldName}: ${truncatedMsg}`;
        });

    const totalErrors = Object.keys(errors).length;
    const headerText = totalErrors === 1 
        ? 'Validasi gagal:' 
        : `Validasi gagal (${totalErrors} field):`;

    const errorText = errorEntries.join('\n');
    return `${headerText}\n${errorText}`;
}

/**
 * Get first error message for quick display
 */
export function getFirstErrorMessage(errors: Record<string, string>): string {
    const [fieldKey, message] = Object.entries(errors)[0];
    const fieldName = formatFieldName(fieldKey);
    const truncatedMsg = truncateMessage(message);
    return `${fieldName}: ${truncatedMsg}`;
}
