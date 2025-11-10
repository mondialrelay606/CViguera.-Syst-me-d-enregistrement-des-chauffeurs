import React, { useState } from 'react';
import { SubcontractorUser } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface SubcontractorManagementProps {
  users: SubcontractorUser[];
  onAddUser: (user: SubcontractorUser) => void;
  onUpdatePassword: (username: string, newPassword: string) => void;
}

const SubcontractorManagement: React.FC<SubcontractorManagementProps> = ({ users, onAddUser, onUpdatePassword }) => {
    const { t } = useTranslation();
    const [newUser, setNewUser] = useState({ username: '', password: '', companyName: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.username && newUser.password && newUser.companyName) {
            onAddUser(newUser);
            setNewUser({ username: '', password: '', companyName: '' });
        }
    };

    const handleChangePassword = (username: string) => {
        const newPassword = prompt(t('adminPanel.subcontractors.newPasswordPrompt', { user: username }));
        if (newPassword) {
            onUpdatePassword(username, newPassword);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row md:space-x-8 rtl:space-x-reverse gap-8">
            <div className="md:w-1/3">
                <h3 className="text-lg font-bold text-slate-700 mb-4">{t('adminPanel.subcontractors.addUser')}</h3>
                <form onSubmit={handleAddUser} className="space-y-4 bg-slate-50/70 p-4 rounded-lg border border-slate-200/60">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">{t('adminPanel.subcontractors.username')}</label>
                        <input type="text" name="username" id="username" value={newUser.username} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">{t('adminPanel.subcontractors.password')}</label>
                        <input type="password" name="password" id="password" value={newUser.password} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">{t('adminPanel.subcontractors.companyName')}</label>
                        <input type="text" name="companyName" id="companyName" value={newUser.companyName} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">{t('general.save')}</button>
                </form>
            </div>

            <div className="md:w-2/3 flex flex-col flex-grow">
                 <h3 className="text-lg font-bold text-slate-700 mb-4">{t('adminPanel.subcontractors.existingUsers')}</h3>
                 <div className="flex-grow overflow-y-auto border border-slate-200/60 rounded-lg">
                    <table className="w-full text-sm text-start text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 table-fixed-header">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">{t('adminPanel.subcontractors.username')}</th>
                                <th scope="col" className="px-6 py-3 font-semibold">{t('adminPanel.subcontractors.companyName')}</th>
                                <th scope="col" className="px-6 py-3 text-end font-semibold">{t('driverList.headers.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {users.map((user, index) => (
                                <tr key={user.username} className={`border-b border-slate-200/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                    <td className="px-6 py-4 font-mono">{user.username}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{user.companyName}</td>
                                    <td className="px-6 py-4 text-end">
                                        <button onClick={() => handleChangePassword(user.username)} className="font-medium text-blue-600 hover:text-blue-800">
                                            {t('adminPanel.subcontractors.changePassword')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubcontractorManagement;
