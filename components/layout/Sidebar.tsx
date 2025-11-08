
import React from 'react';
import { LayoutDashboard, ArrowLeftRight, TrendingUp, TrendingDown, Scale, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Page = 'Dashboard' | 'Penerimaan' | 'Pengeluaran' | 'Laporan Saldo';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const menuItems = [
    { name: 'Dashboard' as Page, icon: <LayoutDashboard size={20} /> },
    { name: 'Penerimaan' as Page, icon: <TrendingUp size={20} /> },
    { name: 'Pengeluaran' as Page, icon: <TrendingDown size={20} /> },
    { name: 'Laporan Saldo' as Page, icon: <Scale size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen }) => {
    const { user, logout } = useAuth();

    const handleLinkClick = (page: Page) => {
        setCurrentPage(page);
        setIsSidebarOpen(false); // Close sidebar on mobile after navigation
    };

    return (
        <>
            <aside 
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6 border-b border-slate-200 flex items-center space-x-3">
                    <div className="bg-sky-500 text-white p-2 rounded-lg">
                        <ArrowLeftRight size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Keuangan Harian</h1>
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleLinkClick(item.name)}
                            className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                currentPage === item.name
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
                            }`}
                        >
                            {item.icon}
                            <span className="font-semibold">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg mb-4">
                        {user?.role === 'admin' ? 
                            <Shield className="h-10 w-10 text-sky-500"/> :
                            <UserIcon className="h-10 w-10 text-slate-500"/>
                        }
                        <div>
                            <p className="font-semibold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full space-x-2 px-4 py-3 rounded-lg transition-colors duration-200 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={20} />
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </aside>
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;