import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Landmark, Trophy, Filter, History } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import api from '../services/googleApiService';
import Spinner from '../components/ui/Spinner';
import { Penerimaan, Pengeluaran } from '../types';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4 transition-all hover:shadow-md hover:-translate-y-1">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

interface MonthlyData {
    name: string;
    Penerimaan: number;
    Pengeluaran: number;
}

interface PieData {
    name: string;
    value: number;
}

interface TransactionListItem {
    id: string;
    tanggal: string;
    keterangan: string;
    tipe: 'Penerimaan' | 'Pengeluaran';
    jumlah: number;
}

const PIE_COLORS_1 = ['#0ea5e9', '#8b5cf6', '#f97316', '#10b981', '#ef4444', '#f59e0b'];
const PIE_COLORS_2 = ['#38bdf8', '#a78bfa', '#fb923c', '#34d399', '#f87171', '#facc15'];

const Dashboard: React.FC = () => {
    const [allPenerimaan, setAllPenerimaan] = useState<Penerimaan[]>([]);
    const [allPengeluaran, setAllPengeluaran] = useState<Pengeluaran[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [penerimaanData, pengeluaranData] = await Promise.all([
                    api.getPenerimaan(),
                    api.getPengeluaran(),
                ]);
                setAllPenerimaan(penerimaanData);
                setAllPengeluaran(pengeluaranData);

                const allTransactions = [...penerimaanData, ...pengeluaranData];
                if (allTransactions.length > 0) {
                    const years = [...new Set(allTransactions.map(t => new Date(t.tanggal).getFullYear()))].sort((a, b) => b - a);
                    setAvailableYears(years);
                    setSelectedYear(years[0] || new Date().getFullYear());
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        const penerimaan = allPenerimaan.filter(p => new Date(p.tanggal).getFullYear() === selectedYear);
        const pengeluaran = allPengeluaran.filter(p => new Date(p.tanggal).getFullYear() === selectedYear);
        return { penerimaan, pengeluaran };
    }, [allPenerimaan, allPengeluaran, selectedYear]);

    const stats = useMemo(() => {
        const { penerimaan, pengeluaran } = filteredData;
        const totalPenerimaan = penerimaan.reduce((sum, p) => sum + p.jumlahPenerimaan, 0);
        const totalPengeluaran = pengeluaran.reduce((sum, p) => sum + p.jumlahPengeluaran, 0);
        const saldo = totalPenerimaan - totalPengeluaran;
        return { totalPenerimaan, totalPengeluaran, saldo };
    }, [filteredData]);

    const monthlyBarData = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const monthlyTotals: { [key: number]: { Penerimaan: number, Pengeluaran: number } } = {};

        filteredData.penerimaan.forEach(p => {
            const month = new Date(p.tanggal).getMonth();
            if (!monthlyTotals[month]) monthlyTotals[month] = { Penerimaan: 0, Pengeluaran: 0 };
            monthlyTotals[month].Penerimaan += p.jumlahPenerimaan;
        });
        
        filteredData.pengeluaran.forEach(p => {
            const month = new Date(p.tanggal).getMonth();
            if (!monthlyTotals[month]) monthlyTotals[month] = { Penerimaan: 0, Pengeluaran: 0 };
            monthlyTotals[month].Pengeluaran += p.jumlahPengeluaran;
        });
        
        return Object.keys(monthlyTotals)
            .map(monthIndexStr => {
                const monthIndex = parseInt(monthIndexStr, 10);
                return {
                    name: monthNames[monthIndex],
                    monthIndex,
                    Penerimaan: monthlyTotals[monthIndex].Penerimaan,
                    Pengeluaran: monthlyTotals[monthIndex].Pengeluaran,
                };
            })
            .sort((a, b) => a.monthIndex - b.monthIndex);

    }, [filteredData]);

    const incomePieData = useMemo(() => {
        const incomeByCategory = filteredData.penerimaan.reduce((acc, p) => {
            acc[p.sumberDana] = (acc[p.sumberDana] || 0) + p.jumlahPenerimaan;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
    }, [filteredData]);
    
    const expensePieData = useMemo(() => {
        const expenseByCategory = filteredData.pengeluaran.reduce((acc, p) => {
            acc[p.kategori] = (acc[p.kategori] || 0) + p.jumlahPengeluaran;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    }, [filteredData]);

    const allTransactionsForYear = useMemo((): TransactionListItem[] => {
        return [
            ...filteredData.penerimaan.map(item => ({ id: item.id, tanggal: item.tanggal, keterangan: item.sumberDana, tipe: 'Penerimaan' as const, jumlah: item.jumlahPenerimaan })),
            ...filteredData.pengeluaran.map(item => ({ id: item.id, tanggal: item.tanggal, keterangan: item.namaBarang, tipe: 'Pengeluaran' as const, jumlah: item.jumlahPengeluaran })),
        ];
    }, [filteredData]);

    const topTransactions = useMemo(() => {
        return [...allTransactionsForYear].sort((a, b) => b.jumlah - a.jumlah).slice(0, 5);
    }, [allTransactionsForYear]);

    const recentTransactions = useMemo(() => {
        return [...allTransactionsForYear].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 5);
    }, [allTransactionsForYear]);


    if (loading) {
        return <div className="flex items-center justify-center h-full"><Spinner text="Memuat Dashboard..." /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Penerimaan" value={formatCurrency(stats.totalPenerimaan)} icon={<TrendingUp className="text-emerald-800" />} color="bg-emerald-100" />
                <StatCard title="Total Pengeluaran" value={formatCurrency(stats.totalPengeluaran)} icon={<TrendingDown className="text-red-800" />} color="bg-red-100" />
                <StatCard title="Saldo Tahun Ini" value={formatCurrency(stats.saldo)} icon={<Landmark className="text-sky-800" />} color="bg-sky-100" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Aktivitas Bulanan</h3>
                        <div className="flex items-center space-x-2">
                            <Filter size={16} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-600">Filter Tahun:</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="input-field py-1 px-3"
                            >
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyBarData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)} Jt`} tick={{ fill: '#64748b' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="Penerimaan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Perbandingan Penerimaan ({selectedYear})</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={incomePieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                                {incomePieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS_1[index % PIE_COLORS_1.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{fontSize: '12px'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Perbandingan Pengeluaran ({selectedYear})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={expensePieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" >
                                {expensePieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS_2[index % PIE_COLORS_2.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{fontSize: '12px'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transaction Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Transactions */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center"><Trophy className="mr-2 text-amber-500" />Top 5 Transaksi Terbesar ({selectedYear})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Keterangan</th>
                                    <th scope="col" className="px-6 py-3">Tipe</th>
                                    <th scope="col" className="px-6 py-3 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topTransactions.length > 0 ? topTransactions.map(activity => (
                                    <tr key={activity.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{activity.keterangan}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${activity.tipe === 'Penerimaan' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {activity.tipe}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-semibold ${activity.tipe === 'Penerimaan' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(activity.jumlah)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">
                                            Tidak ada data transaksi untuk tahun {selectedYear}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center"><History className="mr-2 text-sky-500" />Aktivitas Terkini ({selectedYear})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Tanggal</th>
                                    <th scope="col" className="px-6 py-3">Keterangan</th>
                                    <th scope="col" className="px-6 py-3 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length > 0 ? recentTransactions.map(activity => (
                                    <tr key={activity.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{new Date(activity.tanggal).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4">{activity.keterangan}</td>
                                        <td className={`px-6 py-4 text-right font-semibold ${activity.tipe === 'Penerimaan' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(activity.jumlah)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">
                                            Tidak ada data transaksi untuk tahun {selectedYear}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
