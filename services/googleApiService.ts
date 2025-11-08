
import { Penerimaan, Pengeluaran, User } from '../types';

// --- LOCALSTORAGE PERSISTENCE HELPERS ---

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        localStorage.removeItem(key); // Clear corrupted data
    }
    return defaultValue;
};

const saveToStorage = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to save ${key} to localStorage`, error);
    }
};

// --- DEFAULT DATA FOR INITIALIZATION ---

const defaultUsers: User[] = [
    { name: 'Admin', email: 'admin@keuanganharian.com', password: 'password123', role: 'admin' },
    { name: 'User Biasa', email: 'user@example.com', password: 'password123', role: 'user' },
];

const defaultOptions: Record<string, string[]> = {
    sumberDana: ['Gaji Bulanan', 'Proyek Freelance', 'Bonus Kinerja', 'Penjualan Barang Bekas'],
    kategoriPenerimaan: ['Pendapatan Tetap', 'Pendapatan Tidak Tetap', 'Lain-lain'],
    akun: ['Bank BCA', 'Bank Mandiri', 'GoPay', 'OVO', 'Tunai'],
    rekanan: ['Superindo', 'PLN', 'Warung Padang', 'Bengkel Maju Jaya', 'Cinema XXI'],
    kategoriPengeluaran: ['Kebutuhan Pokok', 'Tagihan', 'Hiburan', 'Transportasi', 'Lain-lain'],
};


// --- IN-MEMORY DATA STORAGE (Initialized from localStorage) ---

let mockPenerimaan: Penerimaan[] = loadFromStorage('mockPenerimaan', []);
let mockPengeluaran: Pengeluaran[] = loadFromStorage('mockPengeluaran', []);
let mockUsers: User[] = loadFromStorage('mockUsers', defaultUsers);
let mockOptions: Record<string, string[]> = loadFromStorage('mockOptions', defaultOptions);


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API FUNCTIONS ---
const api = {
    // --- USER AUTHENTICATION ---
    registerUser: async (name: string, email: string, password: string): Promise<User> => {
        await delay(500);
        if (mockUsers.some(u => u.email === email)) {
            throw new Error('Email sudah terdaftar.');
        }
        const newUser: User = { name, email, password, role: 'user' };
        mockUsers.push(newUser);
        saveToStorage('mockUsers', mockUsers);
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    },
    loginUser: async (email: string, password: string): Promise<User> => {
        await delay(500);
        const user = mockUsers.find(u => u.email === email);
        if (!user || user.password !== password) {
            throw new Error('Email atau kata sandi salah.');
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
    requestPasswordReset: async (email: string): Promise<void> => {
        await delay(500);
        const userExists = mockUsers.some(u => u.email === email);
        if (!userExists) {
            throw new Error('Email tidak ditemukan dalam sistem.');
        }
        // In a real app, you'd generate a token and send an email here.
        // For this mock, we just confirm the email exists.
        return;
    },
    resetPassword: async (email: string, newPassword: string): Promise<void> => {
        await delay(500);
        const userIndex = mockUsers.findIndex(u => u.email === email);
        if (userIndex === -1) {
            throw new Error('Gagal mereset kata sandi: pengguna tidak ditemukan.');
        }
        mockUsers[userIndex] = { ...mockUsers[userIndex], password: newPassword };
        saveToStorage('mockUsers', mockUsers);
        return;
    },

    // --- PENERIMAAN ---
    getPenerimaan: async (): Promise<Penerimaan[]> => {
        await delay(300);
        return JSON.parse(JSON.stringify(mockPenerimaan));
    },
    addPenerimaan: async (data: Omit<Penerimaan, 'id'>): Promise<Penerimaan> => {
        await delay(300);
        const newEntry: Penerimaan = { ...data, id: `p${Date.now()}` };
        mockPenerimaan.push(newEntry);
        saveToStorage('mockPenerimaan', mockPenerimaan);
        return JSON.parse(JSON.stringify(newEntry));
    },
    updatePenerimaan: async (data: Penerimaan): Promise<Penerimaan> => {
        await delay(300);
        const index = mockPenerimaan.findIndex(p => p.id === data.id);
        if (index !== -1) {
            mockPenerimaan[index] = data;
            saveToStorage('mockPenerimaan', mockPenerimaan);
            return JSON.parse(JSON.stringify(data));
        }
        throw new Error('Penerimaan not found');
    },
    deletePenerimaan: async (id: string): Promise<{ id: string }> => {
        await delay(300);
        mockPenerimaan = mockPenerimaan.filter(p => p.id !== id);
        saveToStorage('mockPenerimaan', mockPenerimaan);
        return { id };
    },
    overwritePenerimaan: async (data: Penerimaan[]): Promise<void> => {
        await delay(300);
        mockPenerimaan = data;
        saveToStorage('mockPenerimaan', mockPenerimaan);
    },

    // --- PENGELUARAN ---
    getPengeluaran: async (): Promise<Pengeluaran[]> => {
        await delay(300);
        return JSON.parse(JSON.stringify(mockPengeluaran));
    },
    addPengeluaran: async (data: Omit<Pengeluaran, 'id'>): Promise<Pengeluaran> => {
        await delay(300);
        const newEntry: Pengeluaran = { ...data, id: `e${Date.now()}` };
        mockPengeluaran.push(newEntry);
        saveToStorage('mockPengeluaran', mockPengeluaran);
        return JSON.parse(JSON.stringify(newEntry));
    },
    updatePengeluaran: async (data: Pengeluaran): Promise<Pengeluaran> => {
        await delay(300);
        const index = mockPengeluaran.findIndex(p => p.id === data.id);
        if (index !== -1) {
            mockPengeluaran[index] = data;
            saveToStorage('mockPengeluaran', mockPengeluaran);
            return JSON.parse(JSON.stringify(data));
        }
        throw new Error('Pengeluaran not found');
    },
    deletePengeluaran: async (id: string): Promise<{ id: string }> => {
        await delay(300);
        mockPengeluaran = mockPengeluaran.filter(p => p.id !== id);
        saveToStorage('mockPengeluaran', mockPengeluaran);
        return { id };
    },
    overwritePengeluaran: async (data: Pengeluaran[]): Promise<void> => {
        await delay(300);
        mockPengeluaran = data;
        saveToStorage('mockPengeluaran', mockPengeluaran);
    },

    // --- OPTIONS ---
    getOptions: async (): Promise<Record<string, string[]>> => {
        await delay(100);
        const allSumberDana = [...new Set([...mockOptions.sumberDana, ...mockPenerimaan.map(p => p.sumberDana)])];
        const allKategoriPenerimaan = [...new Set([...mockOptions.kategoriPenerimaan, ...mockPenerimaan.map(p => p.kategori)])];
        const allAkun = [...new Set([...mockOptions.akun, ...mockPenerimaan.map(p => p.akun), ...mockPengeluaran.map(p => p.akun)])];
        const allRekanan = [...new Set([...mockOptions.rekanan, ...mockPengeluaran.map(p => p.rekanan)])];
        const allKategoriPengeluaran = [...new Set([...mockOptions.kategoriPengeluaran, ...mockPengeluaran.map(p => p.kategori)])];

        return JSON.parse(JSON.stringify({
            sumberDana: allSumberDana,
            kategoriPenerimaan: allKategoriPenerimaan,
            akun: allAkun,
            rekanan: allRekanan,
            kategoriPengeluaran: allKategoriPengeluaran,
        }));
    },
    addOption: async (key: string, value: string): Promise<{ key: string, value: string }> => {
        await delay(100);
        if (mockOptions[key] && !mockOptions[key].includes(value)) {
            mockOptions[key].push(value);
            saveToStorage('mockOptions', mockOptions);
        }
        return { key, value };
    },
};

// --- DERIVED FUNCTIONS (Client-Side Logic) ---
const getDashboardStats = async () => {
    const [penerimaan, pengeluaran] = await Promise.all([api.getPenerimaan(), api.getPengeluaran()]);
    const totalPenerimaan = penerimaan.reduce((sum, p) => sum + (p.status === 'Lunas' ? p.jumlahPenerimaan : 0), 0);
    const totalPengeluaran = pengeluaran.reduce((sum, p) => sum + (p.status === 'Lunas' ? p.jumlahPengeluaran : 0), 0);
    const saldo = totalPenerimaan - totalPengeluaran;
    return { totalPenerimaan, totalPengeluaran, saldo };
};

const getSaldoReport = async () => {
    const [penerimaanData, pengeluaranData] = await Promise.all([api.getPenerimaan(), api.getPengeluaran()]);
    const data: { [key: string]: { penerimaan: number; pengeluaran: number } } = {};
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    penerimaanData.forEach(p => {
        const key = `${p.tahun}-${String(p.bulan).padStart(2, '0')}`;
        if (!data[key]) data[key] = { penerimaan: 0, pengeluaran: 0 };
        if (p.status === 'Lunas') data[key].penerimaan += p.jumlahPenerimaan;
    });

    pengeluaranData.forEach(p => {
        const key = `${p.tahun}-${String(p.bulan).padStart(2, '0')}`;
        if (!data[key]) data[key] = { penerimaan: 0, pengeluaran: 0 };
        if (p.status === 'Lunas') data[key].pengeluaran += p.jumlahPengeluaran;
    });

    const sortedKeys = Object.keys(data).sort();
    let saldoAkumulatif = 0;
    const reportData = sortedKeys.map(key => {
        const [year, month] = key.split('-');
        const { penerimaan, pengeluaran } = data[key];
        const saldoBulanan = penerimaan - pengeluaran;
        saldoAkumulatif += saldoBulanan;
        return {
            bulan: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
            penerimaan,
            pengeluaran,
            saldoBulanan,
            saldoAkhir: saldoAkumulatif,
        };
    });

    return reportData.reverse();
};

export default { ...api, getDashboardStats, getSaldoReport };