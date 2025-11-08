
import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { formatCurrency, numberToWords } from '../../utils/formatters';
import api from '../../services/googleApiService';
import { useAuth } from '../../context/AuthContext';

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
    options?: string[];
    required?: boolean;
    placeholder?: string;
    allowAdd?: boolean;
    className?: string;
}

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    fields: FormField[];
    initialData?: any;
    title: string;
    generateId: (date: string) => string;
    transactionType: 'Penerimaan' | 'Pengeluaran';
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSave, fields, initialData, title, generateId, transactionType }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const [options, setOptions] = useState<Record<string, string[]>>({});
    const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

    const resetForm = useCallback(() => {
        const defaultState: any = {};
        fields.forEach(field => {
            if (field.type === 'checkbox') {
                 defaultState[field.name] = true;
            } else {
                 defaultState[field.name] = '';
            }
        });
        const today = new Date().toISOString().split('T')[0];
        defaultState.tanggal = today;
        defaultState.idTransaksi = generateId(today);
        setFormData(defaultState);
    }, [fields, generateId]);


    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData, resetForm]);
    
    useEffect(() => {
        api.getOptions().then(opts => {
            const mappedOptions: Record<string, string[]> = {
                sumberDana: opts.sumberDana || [],
                kategoriPenerimaan: opts.kategoriPenerimaan || [],
                akun: opts.akun || [],
                rekanan: opts.rekanan || [],
                kategoriPengeluaran: opts.kategoriPengeluaran || [],
            };
            setOptions(mappedOptions);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
        
        setFormData((prev: any) => {
            const newFormData = { ...prev, [name]: isCheckbox ? checked : value };
            if (name === 'tanggal' && value) {
                newFormData.idTransaksi = generateId(value);
                const date = new Date(value);
                newFormData.bulan = date.getMonth() + 1;
                newFormData.tahun = date.getFullYear();
            }
            if (name === 'jumlahPenerimaan' || name === 'jumlahPengeluaran') {
                newFormData[name] = value ? parseInt(value, 10) : 0;
            }
            return newFormData;
        });
    };

    const handleAddNewOption = async (fieldName: string) => {
        const value = newOptionInputs[fieldName];
        if (!value) return;

        const optionKey = fieldName === 'kategori' ? `kategori${transactionType}` : fieldName;

        await api.addOption(optionKey as any, value);
        
        setOptions(prev => ({ ...prev, [optionKey]: [...(prev[optionKey] || []), value] }));
        setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
        setNewOptionInputs(prev => ({ ...prev, [fieldName]: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {...formData};
        dataToSave.status = dataToSave.status ? 'Lunas' : 'Pending';

        onSave(dataToSave);
    };

    if (!isOpen) return null;

    const jumlahKey = transactionType === 'Penerimaan' ? 'jumlahPenerimaan' : 'jumlahPengeluaran';
    const terbilangValue = formData[jumlahKey] ? numberToWords(formData[jumlahKey]) : 'Nol Rupiah';


    const renderField = (field: FormField) => {
        const optionKey = field.name === 'kategori' ? `kategori${transactionType}` : field.name;

        if (field.type === 'select') {
            return (
                 <div className="flex flex-col">
                    <label htmlFor={field.name} className="mb-1 text-sm font-medium text-slate-600">{field.label}</label>
                    <div className="flex space-x-2">
                        <select id={field.name} name={field.name} value={formData[field.name] || ''} onChange={handleChange} required={field.required} className="input-field flex-grow">
                             <option value="" disabled>Pilih {field.label}</option>
                            {(options[optionKey] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {field.allowAdd && (
                            <div className="flex">
                                <input type="text" placeholder="Tambah baru..." value={newOptionInputs[field.name] || ''} onChange={(e) => setNewOptionInputs(prev => ({...prev, [field.name]: e.target.value}))} className="input-field rounded-r-none w-32" />
                                <button type="button" onClick={() => handleAddNewOption(field.name)} className="px-3 bg-violet-500 text-white rounded-r-lg hover:bg-violet-600"><Plus size={18}/></button>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        if (field.type === 'checkbox') {
             return (
                <div className="flex items-center space-x-2 pt-6">
                    <input type="checkbox" id={field.name} name={field.name} checked={formData[field.name] === undefined ? true : formData[field.name]} onChange={handleChange} className="h-5 w-5 rounded text-violet-600 focus:ring-violet-500" />
                    <label htmlFor={field.name} className="text-sm font-medium text-slate-700">{field.label}</label>
                </div>
            )
        }
        return (
            <div className="flex flex-col">
                <label htmlFor={field.name} className="mb-1 text-sm font-medium text-slate-600">{field.label}</label>
                {field.type === 'textarea' ? (
                     <textarea id={field.name} name={field.name} value={formData[field.name] || ''} onChange={handleChange} required={field.required} placeholder={field.placeholder} rows={3} className="input-field"></textarea>
                ) : (
                    <input type={field.type} id={field.name} name={field.name} value={formData[field.name] || ''} onChange={handleChange} required={field.required} placeholder={field.placeholder} className="input-field" disabled={field.name === 'idTransaksi'} />
                )}
            </div>
        )
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-scale-in">
                <header className="flex items-center justify-between p-5 border-b border-slate-200">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                        <div className="w-20 h-1 bg-violet-500 mt-1 rounded-full"></div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><X /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                       {fields.map(field => (
                           <div key={field.name} className={field.className}>
                               {renderField(field)}
                           </div>
                       ))}
                    </div>

                    <div className="mt-5 p-4 bg-violet-50 rounded-lg">
                        <label className="text-sm font-medium text-slate-600">Terbilang</label>
                        <p className="text-lg font-semibold text-violet-600 mt-1 transition-all duration-300">
                            {terbilangValue}
                        </p>
                    </div>
                </form>

                <footer className="flex items-center justify-end p-5 border-t border-slate-200 bg-slate-50 rounded-b-xl space-x-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all">
                        Batal
                    </button>
                    {user?.role === 'admin' ? (
                        <button type="submit" form="transaction-form" onClick={handleSubmit} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 transition-all shadow-sm hover:shadow-md flex items-center space-x-2">
                            <Save size={16} />
                            <span>{initialData ? 'Update Data' : 'Simpan Data'}</span>
                        </button>
                    ) : (
                        <div className="relative group">
                            <button disabled className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-violet-300 cursor-not-allowed flex items-center space-x-2">
                                <Save size={16} />
                                <span>Simpan Data</span>
                            </button>
                            <span className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                User tidak dapat menyimpan data.
                            </span>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default TransactionFormModal;
