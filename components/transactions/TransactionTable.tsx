import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Database } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface Column {
    key: string;
    header: string;
    render?: (row: any) => React.ReactNode;
}

interface TransactionTableProps {
    data: any[];
    columns: Column[];
    onEdit: (row: any) => void;
    onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data, columns, onEdit, onDelete }) => {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            {columns.map(col => <th key={col.key} scope="col" className="px-6 py-3">{col.header}</th>)}
                             {user?.role === 'admin' && <th scope="col" className="px-6 py-3 text-center">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map(row => (
                                <tr key={row.id} className="bg-white border-b hover:bg-slate-50">
                                    {columns.map(col => (
                                        <td key={`${row.id}-${col.key}`} className="px-6 py-4 whitespace-nowrap">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    {user?.role === 'admin' && (
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => onEdit(row)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-full transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => onDelete(row.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (user?.role === 'admin' ? 1 : 0)} className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <Database size={40} className="mb-2" />
                                        <h3 className="text-lg font-semibold">Tidak Ada Data</h3>
                                        <p className="text-sm">Silakan impor data dari Excel atau tambahkan data baru.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data.length > 0 && (
                <div className="flex justify-between items-center pt-4">
                    <span className="text-sm text-slate-500">
                        Menampilkan {paginatedData.length} dari {data.length} data
                    </span>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTable;