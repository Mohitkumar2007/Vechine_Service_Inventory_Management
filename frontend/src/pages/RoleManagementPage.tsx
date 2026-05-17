import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

interface AppUser { user_id: number; username: string; full_name: string; role: string; email: string; is_active: string; }

export function RoleManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', fullName: '', role: 'RECEPTION', email: '' });

  const loadUsers = async () => {
    if (!user) return;
    try {
      setUsers(await apiRequest<AppUser[]>('/users/', { role: user.role }));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load users');
    }
  };

  useEffect(() => { loadUsers(); }, [user?.role]);

  const addUser = async () => {
    if (!userForm.username.trim() || !userForm.password.trim() || !userForm.fullName.trim()) {
      notify('Username, password, and full name are required');
      return;
    }
    try {
      await apiRequest('/users/', {
        method: 'POST',
        role: user?.role,
        body: JSON.stringify({
          username: userForm.username,
          password: userForm.password,
          full_name: userForm.fullName,
          role: userForm.role,
          email: userForm.email || null,
        }),
      });
      notify('User created in MySQL');
      setUserForm({ username: '', password: '', fullName: '', role: 'RECEPTION', email: '' });
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not create user');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">User Role Management</h2>
          <p className="text-slate-400">Owner/Admin control for role-based access to Oracle-backed modules.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2"><Users size={16} /> Add User</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Reception', 'Mechanic', 'Billing Counter', 'Owner/Admin'].map((role) => (
          <Card key={role} className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-5">
              <ShieldCheck className="text-orange-500" size={22} />
              <p className="mt-4 text-white font-bold">{role}</p>
              <p className="text-xs text-slate-500">Permission group active</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-800 bg-slate-950/40">
        <CardHeader>
          <CardTitle>Application Users</CardTitle>
          <CardDescription>Demo credentials mirror backend user roles for DBMS presentation.</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell className="font-semibold text-white">{user.full_name}</TableCell>
                <TableCell className="font-mono text-xs text-slate-400">{user.username}</TableCell>
                <TableCell><Badge variant={user.role === 'ADMIN' ? 'info' : 'warning'}>{user.role}</Badge></TableCell>
                <TableCell className="text-slate-400 text-sm">{user.is_active === 'Y' ? 'Active' : 'Inactive'} role-scoped access</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => notify(`${user.username} password reset link generated`)}><KeyRound size={14} className="mr-2" />Reset</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add User" description="Create a role-based application user.">
        <form onSubmit={(event) => { event.preventDefault(); addUser(); }} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input value={userForm.username} onChange={(event) => setUserForm((form) => ({ ...form, username: event.target.value }))} placeholder="Username" />
          <Input value={userForm.password} onChange={(event) => setUserForm((form) => ({ ...form, password: event.target.value }))} placeholder="Password" type="password" />
          <Input value={userForm.fullName} onChange={(event) => setUserForm((form) => ({ ...form, fullName: event.target.value }))} placeholder="Full name" />
          <select value={userForm.role} onChange={(event) => setUserForm((form) => ({ ...form, role: event.target.value }))} className="h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="RECEPTION">Reception</option>
            <option value="MECHANIC">Mechanic</option>
            <option value="BILLING">Billing</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Input value={userForm.email} onChange={(event) => setUserForm((form) => ({ ...form, email: event.target.value }))} placeholder="Email" />
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
