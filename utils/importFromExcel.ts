// Since XLSX is loaded from a script tag, we need to declare it to satisfy TypeScript
declare var XLSX: any;

/**
 * Parses an Excel file and converts the first sheet to an array of JSON objects.
 * @param file The Excel file to parse.
 * @returns A promise that resolves with an array of objects from the Excel sheet.
 */
export const importFromExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("Tidak ada file yang dipilih."));
        }
        if (typeof XLSX === 'undefined') {
            return reject(new Error("Library XLSX tidak termuat. Pastikan koneksi internet Anda aktif."));
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) {
                    return reject(new Error("File Excel tidak berisi sheet yang valid."));
                }
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
                reject(new Error("Gagal mem-parsing file Excel. Pastikan format file benar."));
            }
        };

        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            reject(new Error("Terjadi kesalahan saat membaca file."));
        };

        reader.readAsArrayBuffer(file);
    });
};
