
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Penerimaan from './pages/Penerimaan';
import Pengeluaran from './pages/Pengeluaran';
import LaporanSaldo from './pages/LaporanSaldo';
import AuthPage from './pages/AuthPage';

type Page = 'Dashboard' | 'Penerimaan' | 'Pengeluaran' | 'Laporan Saldo';

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading } = useAuth();

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Penerimaan':
                return <Penerimaan />;
            case 'Pengeluaran':
                return <Pengeluaran />;
            case 'Laporan Saldo':
                return <LaporanSaldo />;
            default:
                return <Dashboard />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="w-16 h-16 border-4 border-t-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (!user) {
        return <AuthPage />;
    }

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800">
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    currentPage={currentPage} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
