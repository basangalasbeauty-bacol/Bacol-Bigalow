
import React from 'react';
import { Calendar, UserCircle, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
    currentPage: string;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setIsSidebarOpen }) => {
    const { user } = useAuth();
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="bg-white shadow-sm p-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center">
                <button 
                    className="md:hidden mr-4 p-2 rounded-full hover:bg-slate-100"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={24} className="text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800">{currentPage.startsWith('Data') ? currentPage : `Data ${currentPage}`}</h2>
            </div>
            <div className="flex items-center space-x-6">
                <div className="hidden sm:flex items-center space-x-2 text-slate-600">
                    <Calendar size={20} />
                    <span className="font-medium text-sm">{today}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                    <UserCircle size={20} />
                    <span className="font-semibold text-sm">{user?.name}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;