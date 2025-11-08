/**
 * Parses a date from various string formats or an Excel serial number into a valid Date object.
 * This function is designed to be robust against common date formats found in Excel files.
 * @param dateInput The date value from Excel (e.g., '15/08/2024', '2024-08-15', or 45518).
 * @returns A Date object, or null if the format is unrecognized or invalid.
 */
export const parseDate = (dateInput: any): Date | null => {
    if (dateInput === null || dateInput === undefined || dateInput === '') {
        return null;
    }

    // 1. Handle Excel's numeric date format (serial number)
    if (typeof dateInput === 'number') {
        const date = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    // 2. Handle string formats
    if (typeof dateInput === 'string') {
        const str = dateInput.trim();
        let date: Date | null = null;
        
        const parts = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
        
        if (parts) {
            let day = parseInt(parts[1], 10);
            let month = parseInt(parts[2], 10);
            let year = parseInt(parts[3], 10);

            if (year < 100) {
                year += 2000;
            }

            // Prioritize DD/MM/YYYY format, common in 'id-ID' locale.
            if (day > 12) {
                // Format is clearly DD/MM/YYYY
                date = new Date(year, month - 1, day);
            } else if (month > 12) {
                // Format must be MM/DD/YYYY, swap day and month
                date = new Date(year, day - 1, month);
            } else {
                // Ambiguous (e.g., 10/11/2024). Assume DD/MM/YYYY.
                date = new Date(year, month - 1, day);
            }
        } else {
            // Fallback to native parser for ISO 8601 formats (YYYY-MM-DD)
            date = new Date(str);
        }

        if (date && !isNaN(date.getTime())) {
            return date;
        }
    }
    
    // 3. Handle if it's already a valid Date object
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        return dateInput;
    }

    return null;
};
