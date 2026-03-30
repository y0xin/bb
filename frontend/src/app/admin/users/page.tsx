"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield,
  Mail,
  X,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role?: Role;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const [uRes, rRes] = await Promise.all([
        fetch(`${strapiUrl}/api/users?populate=role`, {
          headers: { 'Authorization': `Bearer ${currentUser?.jwt}` }
        }).then(r => r.json()),
        fetch(`${strapiUrl}/api/users-permissions/roles`, {
          headers: { 'Authorization': `Bearer ${currentUser?.jwt}` }
        }).then(r => r.json())
      ]);

      if (Array.isArray(uRes)) setUsers(uRes);
      if (rRes.roles) setRoles(rRes.roles);
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.jwt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (String(id) === String(currentUser?.id)) return alert('Вы не можете удалить самого себя!');
    if (!confirm('Удалить этого пользователя?')) return;
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentUser?.jwt}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-white uppercase">Пользователи</h1>
          <p className="text-gray-500 font-medium">Управление учетными записями и правами доступа</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl active:scale-95"
        >
          <UserPlus size={20} /> Создать пользователя
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.id} className="glass rounded-[32px] border border-white/10 p-8 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden shadow-2xl">
             <div className="flex items-start justify-between mb-8">
                <div className="flex gap-4">
                   <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-500/10 shrink-0">
                      <UserIcon size={32} />
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-xl font-black tracking-tight text-white truncate">{u.username}</h3>
                      <p className="text-gray-400 text-xs font-bold leading-tight flex items-center gap-1 mt-1 truncate">
                         <Mail size={10} /> {u.email}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <span className="glass bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                      {u.role?.name || 'Public'}
                   </span>
                </div>
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                  className="flex-1 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 text-white"
                >
                   <Edit size={14} /> Изменить
                </button>
                <button 
                  onClick={() => handleDelete(u.id)}
                  disabled={String(u.id) === String(currentUser?.id)}
                  className="p-3 glass rounded-2xl text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30"
                >
                   <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
        {!loading && users.length === 0 && (
           <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/10 opacity-30">
              <UserIcon size={48} className="mx-auto mb-4 text-white" />
              <p className="font-black uppercase tracking-widest text-xs text-white">Пользователи не найдены</p>
           </div>
        )}
      </div>

      {isModalOpen && (
        <UserModal 
          onClose={() => setIsModalOpen(false)} 
          userToEdit={selectedUser} 
          roles={roles}
          onSave={fetchData} 
        />
      )}
    </div>
  );
}

interface UserModalProps {
  onClose: () => void;
  userToEdit: User | null;
  roles: Role[];
  onSave: () => void;
}

interface UserForm {
  username: string;
  email: string;
  password?: string;
  role: string | number;
  confirmed: boolean;
}

function UserModal({ onClose, userToEdit, roles, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<UserForm>(userToEdit ? {
    username: userToEdit.username,
    email: userToEdit.email,
    role: userToEdit.role?.id || '',
    confirmed: userToEdit.confirmed
  } : {
    username: '',
    email: '',
    password: '',
    role: roles[0]?.id || '',
    confirmed: true
  });
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const url = userToEdit ? `${strapiUrl}/api/users/${userToEdit.id}` : `${strapiUrl}/api/users`;
      
      const res = await fetch(url, {
        method: userToEdit ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.jwt}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Ошибка сохранения');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
      <div className="glass w-full max-w-lg rounded-[44px] border border-white/10 overflow-hidden shadow-3xl">
        <header className="p-10 border-b border-white/5 flex justify-between items-center bg-blue-600/5 text-white">
            <h2 className="text-2xl font-black tracking-tight">{userToEdit ? 'Править профиль' : 'Новый пользователь'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all"><X /></button>
        </header>
        <form onSubmit={handleSave} className="p-10 space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Имя пользователя</label>
                  <input 
                    type="text" required value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    placeholder="ivan_admin"
                    className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Email адрес</label>
                  <input 
                    type="email" required value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@mail.uz"
                    className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent"
                  />
               </div>
               {!userToEdit && (
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Пароль</label>
                    <input 
                      type="password" required value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent"
                    />
                 </div>
               )}
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Роль доступа</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold bg-black/40 text-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id} className="bg-black">{r.name}</option>
                    ))}
                  </select>
               </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-5 rounded-[28px] font-black text-lg shadow-2xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={20} />
                  <span>{userToEdit ? 'Обновить доступ' : 'Создать аккаунт'}</span>
                </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
}
