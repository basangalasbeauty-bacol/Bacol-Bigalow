
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Mail, Lock, User as UserIcon, Loader2, Send, KeyRound } from 'lucide-react';
import api from '../services/googleApiService';

type View = 'login' | 'register' | 'forgotPassword' | 'resetPassword';

const AuthPage: React.FC = () => {
    const [view, setView] = useState<View>('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [emailToReset, setEmailToReset] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setSuccess('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!formData.email || !formData.password) {
                throw new Error("Email dan kata sandi harus diisi.");
            }
            await login(formData.email, formData.password);
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (!formData.name || !formData.email || !formData.password) {
                throw new Error("Semua field harus diisi.");
            }
            if (formData.password.length < 6) {
                throw new Error("Kata sandi minimal 6 karakter.");
            }
            await register(formData.name, formData.email, formData.password);
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (!formData.email) {
                throw new Error("Email harus diisi.");
            }
            await api.requestPasswordReset(formData.email);
            setEmailToReset(formData.email);
            setSuccess(`Instruksi reset telah dikirim (simulasi). Silakan atur kata sandi baru Anda.`);
            setView('resetPassword');
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (!formData.password || !formData.confirmPassword) {
                throw new Error("Semua field kata sandi harus diisi.");
            }
            if (formData.password !== formData.confirmPassword) {
                throw new Error("Kata sandi tidak cocok.");
            }
            if (formData.password.length < 6) {
                throw new Error("Kata sandi minimal 6 karakter.");
            }
            await api.resetPassword(emailToReset, formData.password);
            setSuccess('Kata sandi berhasil diubah! Silakan masuk dengan kata sandi baru Anda.');
            setView('login');
            setFormData({ name: '', email: emailToReset, password: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    const switchView = (newView: View) => {
        setView(newView);
        setError('');
        setSuccess('');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    };

    const renderTitle = () => {
        switch (view) {
            case 'login': return 'Masuk untuk melanjutkan';
            case 'register': return 'Buat akun baru';
            case 'forgotPassword': return 'Lupa Kata Sandi';
            case 'resetPassword': return 'Atur Ulang Kata Sandi';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-sky-500 text-white p-3 rounded-xl mb-4">
                        <ArrowLeftRight size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Data Keuangan Harian</h1>
                    <p className="mt-2 text-slate-500">{renderTitle()}</p>
                </div>
                
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</p>}
                {success && <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg text-center">{success}</p>}

                {view === 'login' && (
                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="password" name="password" placeholder="Kata Sandi" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <div className="text-right text-sm">
                            <button type="button" onClick={() => switchView('forgotPassword')} className="font-semibold text-sky-600 hover:text-sky-500">Lupa Kata Sandi?</button>
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 disabled:bg-sky-400">
                            {loading ? <Loader2 className="animate-spin" /> : 'Masuk'}
                        </button>
                        <p className="text-center text-sm text-slate-500">
                            Belum punya akun?{' '}
                            <button type="button" onClick={() => switchView('register')} className="font-semibold text-sky-600 hover:text-sky-500">Daftar di sini</button>
                        </p>
                    </form>
                )}

                {view === 'register' && (
                     <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="text" name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="password" name="password" placeholder="Kata Sandi" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                         <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 disabled:bg-sky-400">
                             {loading ? <Loader2 className="animate-spin" /> : 'Daftar'}
                         </button>
                         <p className="text-center text-sm text-slate-500">
                            Sudah punya akun?{' '}
                            <button type="button" onClick={() => switchView('login')} className="font-semibold text-sky-600 hover:text-sky-500">Masuk di sini</button>
                         </p>
                     </form>
                )}
                
                {view === 'forgotPassword' && (
                    <form className="space-y-4" onSubmit={handleForgotPasswordSubmit}>
                        <p className="text-sm text-center text-slate-600">Masukkan email Anda. Kami akan mengirimkan instruksi (simulasi) untuk mengatur ulang kata sandi Anda.</p>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-all duration-300 disabled:bg-sky-400">
                             {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} className="mr-2"/> Kirim Instruksi</>}
                        </button>
                         <p className="text-center text-sm text-slate-500">
                            Ingat kata sandi Anda?{' '}
                            <button type="button" onClick={() => switchView('login')} className="font-semibold text-sky-600 hover:text-sky-500">Kembali ke Login</button>
                         </p>
                    </form>
                )}

                {view === 'resetPassword' && (
                    <form className="space-y-4" onSubmit={handleResetPasswordSubmit}>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="password" name="password" placeholder="Kata Sandi Baru" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="password" name="confirmPassword" placeholder="Konfirmasi Kata Sandi Baru" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-all duration-300 disabled:bg-sky-400">
                             {loading ? <Loader2 className="animate-spin" /> : <><KeyRound size={16} className="mr-2" /> Atur Ulang Kata Sandi</>}
                        </button>
                    </form>
                )}
                
                 <p className="text-center text-xs text-slate-400 pt-4 border-t">
                    Login sebagai <span className="font-semibold">admin@keuanganharian.com</span> dengan kata sandi <span className="font-semibold">password123</span> untuk akses admin.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;