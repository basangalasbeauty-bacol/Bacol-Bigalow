
export interface User {
    name: string;
    email: string;
    password?: string; // password is optional as it shouldn't be exposed on the client
    role: 'admin' | 'user';
}

export interface Penerimaan {
    id: string;
    tanggal: string;
    sumberDana: string;
    idTransaksi: string;
    jumlahPenerimaan: number;
    status: 'Lunas' | 'Pending';
    kategori: string;
    akun: string;
    bulan: number;
    tahun: number;
    keterangan: string;
}

export interface Pengeluaran {
    id: string;
    tanggal: string;
    namaBarang: string;
    idTransaksi: string;
    jumlahPengeluaran: number;
    rekanan: string;
    status: 'Lunas' | 'Pending';
    kategori: string;
    akun: string;
    bulan: number;
    tahun: number;
    keterangan: string;
}

export type Transaction = Penerimaan | Pengeluaran;

export interface SaldoReportData {
    bulan: string;
    penerimaan: number;
    pengeluaran: number;
    saldoBulanan: number;
}
