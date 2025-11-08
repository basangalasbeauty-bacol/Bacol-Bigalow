
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export const numberToWords = (num: number): string => {
    const ones = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
    const teens = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
    const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];
    const thousands = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun'];

    if (num === 0) return 'Nol';

    const numToWords = (n: number): string => {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
        if (n < 1000) {
            if (n === 100) return 'Seratus';
            if (n < 200) return `Seratus ${numToWords(n - 100)}`.trim();
            return `${ones[Math.floor(n / 100)]} Ratus ${numToWords(n % 100)}`.trim();
        }
        return '';
    };

    let i = 0;
    let words = '';
    while (num > 0) {
        if (num % 1000 !== 0) {
            let part = numToWords(num % 1000);
            if (i === 1 && num % 1000 === 1) part = 'Seribu';
            words = `${part} ${thousands[i]} ${words}`.trim();
        }
        num = Math.floor(num / 1000);
        i++;
    }

    return (words.trim() + ' Rupiah').replace(/\s+/g, ' ');
};
