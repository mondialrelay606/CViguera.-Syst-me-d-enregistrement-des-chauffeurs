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
        <div className="h-full flex flex-col md:flex-row md:space-x-8 rtl:space-x-reverse">
            {/* Add User Form */}
            <div className="md:w-1/3 mb-8 md:mb-0">
                <h3 className="text-lg font-bold text-gray-700 mb-4">{t('adminPanel.subcontractors.addUser')}</h3>
                <form onSubmit={handleAddUser} className="space-y-4 bg-gray-50/80 p-4 rounded-lg border">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">{t('adminPanel.subcontractors.username')}</label>
                        <input type="text" name="username" id="username" value={newUser.username} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('adminPanel.subcontractors.password')}</label>
                        <input type="password" name="password" id="password" value={newUser.password} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">{t('adminPanel.subcontractors.companyName')}</label>
                        <input type="text" name="companyName" id="companyName" value={newUser.companyName} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">{t('general.save')}</button>
                </form>
            </div>

            {/* Existing Users List */}
            <div className="md:w-2/3 flex-grow overflow-y-auto">
                 <h3 className="text-lg font-bold text-gray-700 mb-4">{t('adminPanel.subcontractors.existingUsers')}</h3>
                 <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-start text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('adminPanel.subcontractors.username')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminPanel.subcontractors.companyName')}</th>
                                <th scope="col" className="px-6 py-3 text-end">{t('driverList.headers.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.username} className="bg-white/70 border-b border-gray-200/50 hover:bg-gray-50/70">
                                    <td className="px-6 py-4 font-mono">{user.username}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{user.companyName}</td>
                                    <td className="px-6 py-4 text-end">
                                        <button onClick={() => handleChangePassword(user.username)} className="text-blue-600 hover:text-blue-900 font-medium">
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
