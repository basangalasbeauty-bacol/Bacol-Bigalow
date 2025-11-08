import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/googleApiService';
import { SaldoReportData } from '../types';
import Spinner from '../components/ui/Spinner';
import { formatCurrency } from '../utils/formatters';
import { Filter, Download } from 'lucide-react';
import { exportToExcel } from '../utils/exportToExcel';

const LaporanSaldo: React.FC = () => {
    const [reportData, setReportData] = useState<(SaldoReportData & { saldoAkhir: number })[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getSaldoReport();
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch balance report:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleExport = () => {
        const dataToExport = reportData.map(item => ({
            'Bulan': item.bulan,
            'Penerimaan': item.penerimaan,
            'Pengeluaran': item.pengeluaran,
            'Saldo Bulanan': item.saldoBulanan,
            'Saldo Akhir': item.saldoAkhir,
        }));
        exportToExcel(dataToExport, 'Laporan_Saldo_Bulanan');
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Spinner text="Menyiapkan Laporan..." /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Laporan Saldo</h2>
                <button onClick={handleExport} className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-md">
                    <Download size={20} />
                    <span>Export Excel</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-slate-200">
                    <Filter className="text-sky-500" />
                    <h3 className="text-lg font-semibold text-slate-700">Filter Laporan</h3>
                    <select className="input-field w-48">
                        <option>Semua Tanggal</option>
                    </select>
                     <select className="input-field w-48">
                        <option>Semua Bulan</option>
                    </select>
                    <select className="input-field w-48">
                        <option>Tahun 2024</option>
                    </select>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Bulan</th>
                                <th scope="col" className="px-6 py-3 text-right">Penerimaan</th>
                                <th scope="col" className="px-6 py-3 text-right">Pengeluaran</th>
                                <th scope="col" className="px-6 py-3 text-right">Saldo Bulanan</th>
                                <th scope="col" className="px-6 py-3 text-right">Saldo Akhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((row) => (
                                <tr key={row.bulan} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{row.bulan}</td>
                                    <td className="px-6 py-4 text-right text-emerald-600">{formatCurrency(row.penerimaan)}</td>
                                    <td className="px-6 py-4 text-right text-red-600">{formatCurrency(row.pengeluaran)}</td>
                                    <td className={`px-6 py-4 text-right font-medium ${row.saldoBulanan >= 0 ? 'text-slate-700' : 'text-red-700'}`}>{formatCurrency(row.saldoBulanan)}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${row.saldoAkhir >= 0 ? 'text-sky-700' : 'text-red-700'}`}>{formatCurrency(row.saldoAkhir)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LaporanSaldo;