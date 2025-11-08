

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, DollarSign, CheckCircle, Clock, Hash, Download, Upload } from 'lucide-react';
import api from '../services/googleApiService';
import { Penerimaan as PenerimaanType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { exportToExcel } from '../utils/exportToExcel';
import { importFromExcel } from '../utils/importFromExcel';
import { parseDate } from '../utils/parseDate';

import Spinner from '../components/ui/Spinner';
import Notification from '../components/ui/Notification';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFormModal from '../components/transactions/TransactionFormModal';

interface StatBoxProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatBox: React.FC<StatBoxProps> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
        {icon}
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const formFields = [
    { name: 'tanggal', label: 'Tanggal', type: 'date' as const, required: true },
    { name: 'idTransaksi', label: 'ID Transaksi', type: 'text' as const, required: true },
    { name: 'jumlahPenerimaan', label: 'Jumlah Penerimaan', type: 'number' as const, required: true, placeholder: '50000' },
    { name: 'status', label: 'Lunas', type: 'checkbox' as const },
    { name: 'sumberDana', label: 'Sumber Dana', type: 'select' as const, required: true, allowAdd: true, className: 'lg:col-span-2' },
    { name: 'kategori', label: 'Kategori', type: 'select' as const, required: true, allowAdd: true, className: 'lg:col-span-2' },
    { name: 'akun', label: 'Akun', type: 'select' as const, required: true, allowAdd: true, className: 'lg:col-span-2' },
    { name: 'keterangan', label: 'Keterangan', type: 'textarea' as const, placeholder: 'Catatan tambahan...', className: 'sm:col-span-2 lg:col-span-4' },
];

const Penerimaan: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<PenerimaanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<PenerimaanType | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [filters, setFilters] = useState({
        sumberDana: '',
        kategori: '',
        akun: '',
        bulan: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.getPenerimaan();
            setData(result.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setNotification({ message: 'Gagal memuat data.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filterOptions = useMemo(() => {
        const sumberDana = [...new Set(data.map(item => item.sumberDana))].sort();
        const kategori = [...new Set(data.map(item => item.kategori))].sort();
        const akun = [...new Set(data.map(item => item.akun))].sort();
        return { sumberDana, kategori, akun };
    }, [data]);
    
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const itemMonth = (new Date(item.tanggal).getMonth() + 1).toString();
            return (
                (filters.sumberDana ? item.sumberDana === filters.sumberDana : true) &&
                (filters.kategori ? item.kategori === filters.kategori : true) &&
                (filters.akun ? item.akun === filters.akun : true) &&
                (filters.bulan ? itemMonth === filters.bulan : true)
            );
        });
    }, [data, filters]);

    const stats = useMemo(() => {
        return {
            total: filteredData.reduce((sum, item) => sum + item.jumlahPenerimaan, 0),
            diterima: filteredData.filter(item => item.status === 'Lunas').reduce((sum, item) => sum + item.jumlahPenerimaan, 0),
            pending: filteredData.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.jumlahPenerimaan, 0),
            transaksi: filteredData.length,
        }
    }, [filteredData]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const monthOptions = [
        { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
        { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
    ];

    const handleOpenModal = () => {
        setEditingData(null);
        setIsModalOpen(true);
    };

    const handleEdit = (rowData: PenerimaanType) => {
        setEditingData(rowData);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            setLoading(true);
            try {
                await api.deletePenerimaan(id);
                setNotification({ message: 'Data berhasil dihapus!', type: 'success' });
                fetchData();
            } catch (error) {
                 setNotification({ message: 'Gagal menghapus data.', type: 'error' });
                 setLoading(false);
            }
        }
    };

    const handleSave = async (formData: any) => {
        if (user?.role !== 'admin') {
            setNotification({ message: 'Anda tidak memiliki izin untuk menyimpan data.', type: 'error' });
            return;
        }
        setLoading(true);
        setIsModalOpen(false);
        try {
            if (editingData) {
                await api.updatePenerimaan(formData);
                setNotification({ message: 'Data berhasil diperbarui!', type: 'success' });
            } else {
                await api.addPenerimaan(formData);
                setNotification({ message: 'Data baru berhasil disimpan!', type: 'success' });
            }
            fetchData();
        } catch (error) {
            setNotification({ message: 'Gagal menyimpan data.', type: 'error' });
            setLoading(false);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredData.map(item => ({
            'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
            'ID Transaksi': item.idTransaksi,
            'Sumber Dana': item.sumberDana,
            'Jumlah': item.jumlahPenerimaan,
            'Status': item.status,
            'Kategori': item.kategori,
            'Akun': item.akun,
            'Keterangan': item.keterangan,
        }));
        exportToExcel(dataToExport, 'Laporan_Penerimaan');
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const rawData = await importFromExcel(file);
            const transformedData = rawData.map((row: any, index: number): PenerimaanType => {
                const date = parseDate(row['Tanggal']);

                if (!date) {
                    throw new Error(`Baris ${index + 2}: Format tanggal tidak valid.`);
                }
                
                const jumlah = Number(row['Jumlah']);
                if (isNaN(jumlah)) {
                    throw new Error(`Baris ${index + 2}: Jumlah harus berupa angka.`);
                }

                return {
                    id: `imported-${Date.now()}-${index}`,
                    tanggal: date.toISOString().split('T')[0],
                    idTransaksi: row['ID Transaksi']?.toString() || `IMP-P-${Date.now()}-${index}`,
                    sumberDana: row['Sumber Dana']?.toString() || 'Tidak Diketahui',
                    jumlahPenerimaan: jumlah,
                    status: row['Status'] === 'Lunas' ? 'Lunas' : 'Pending',
                    kategori: row['Kategori']?.toString() || 'Lain-lain',
                    akun: row['Akun']?.toString() || 'Tidak Diketahui',
                    bulan: date.getMonth() + 1,
                    tahun: date.getFullYear(),
                    keterangan: row['Keterangan']?.toString() || '',
                };
            });

            await api.overwritePenerimaan(transformedData);
            setNotification({ message: `Berhasil mengimpor ${transformedData.length} data penerimaan.`, type: 'success' });
            fetchData();

        } catch (error: any) {
            setNotification({ message: `Gagal mengimpor: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
            event.target.value = ''; // Reset input
        }
    };

    const generateId = (date: string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const newCount = data.filter(d => d.tanggal === date).length + 1;
        return `DP${year}${month}${day}-${String(newCount).padStart(3, '0')}`;
    };

    const columns = [
        { key: 'tanggal', header: 'Tanggal', render: (row: PenerimaanType) => new Date(row.tanggal).toLocaleDateString('id-ID') },
        { key: 'idTransaksi', header: 'ID Transaksi' },
        { key: 'sumberDana', header: 'Sumber Dana' },
        { key: 'jumlahPenerimaan', header: 'Jumlah', render: (row: PenerimaanType) => formatCurrency(row.jumlahPenerimaan) },
        { key: 'status', header: 'Status', render: (row: PenerimaanType) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {row.status}
            </span>
        )},
        { key: 'kategori', header: 'Kategori' },
        { key: 'akun', header: 'Akun' },
    ];

    return (
        <div className="space-y-6">
            {loading && <Spinner overlay text={loading ? 'Memproses...' : undefined} />}
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Data Penerimaan Harian</h2>
                <div className="flex items-center space-x-2">
                     <label htmlFor="import-penerimaan" className="cursor-pointer flex items-center space-x-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                        <Upload size={20} />
                        <span>Impor Excel</span>
                    </label>
                    <input type="file" id="import-penerimaan" className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
                    
                    <button onClick={handleExport} className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-md">
                        <Download size={20} />
                        <span>Export Excel</span>
                    </button>
                    <button onClick={handleOpenModal} className="flex items-center space-x-2 bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors shadow-sm hover:shadow-md">
                        <Plus size={20} />
                        <span>Tambah Data Baru</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
                <h3 className="font-semibold text-slate-700 col-span-2 md:col-span-4 lg:col-span-1">Filter Data:</h3>
                <select name="sumberDana" value={filters.sumberDana} onChange={handleFilterChange} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
                    <option value="">Semua Sumber Dana</option>
                    {filterOptions.sumberDana.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="kategori" value={filters.kategori} onChange={handleFilterChange} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
                    <option value="">Semua Kategori</option>
                    {filterOptions.kategori.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="akun" value={filters.akun} onChange={handleFilterChange} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
                    <option value="">Semua Akun</option>
                    {filterOptions.akun.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="bulan" value={filters.bulan} onChange={handleFilterChange} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
                    <option value="">Semua Bulan</option>
                    {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox title="Jumlah Penerimaan" value={formatCurrency(stats.total)} icon={<DollarSign className="text-sky-500"/>}/>
                <StatBox title="Jumlah Diterima" value={formatCurrency(stats.diterima)} icon={<CheckCircle className="text-emerald-500"/>}/>
                <StatBox title="Jumlah Pending" value={formatCurrency(stats.pending)} icon={<Clock className="text-amber-500"/>}/>
                <StatBox title="Data Transaksi" value={stats.transaksi} icon={<Hash className="text-slate-500"/>}/>
            </div>

            <TransactionTable data={filteredData} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />

            {isModalOpen && (
                <TransactionFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    fields={formFields}
                    initialData={editingData ? {...editingData, status: editingData.status === 'Lunas'} : undefined}
                    title={editingData ? 'Edit Data Penerimaan' : 'Form Input Data Penerimaan Baru'}
                    generateId={generateId}
                    transactionType="Penerimaan"
                />
            )}
        </div>
    );
};

export default Penerimaan;