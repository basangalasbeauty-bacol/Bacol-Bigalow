// Since XLSX is loaded from a script tag, we need to declare it to satisfy TypeScript
declare var XLSX: any;

/**
 * Exports an array of objects to an Excel file.
 * @param data The data to export.
 * @param fileName The name of the file to be created (without extension).
 */
export const exportToExcel = (data: any[], fileName: string): void => {
    if (typeof XLSX === 'undefined') {
        console.error("XLSX library is not loaded. Make sure you are connected to the internet.");
        alert("Fungsi ekspor tidak tersedia. Pastikan Anda terhubung ke internet.");
        return;
    }

    if (!data || data.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
    }

    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        // Set column widths for better readability
        const colWidths = Object.keys(data[0]).map(key => ({
            wch: Math.max(key.length, 15) // Set width based on header length or a minimum of 15
        }));
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("Terjadi kesalahan saat mengekspor data ke Excel.");
    }
};
