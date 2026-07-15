import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input, Label } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { userService } from '../../../services/userService';
import { addNotification } from '../../../store/notificationSlice';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const dispatch = useDispatch();

  // Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Worker');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await userService.getUsers();
      setUsers(data);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUserId(null);
    setNewName('');
    setNewEmail('');
    setNewRole('Worker');
    setNewPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewPassword('********'); // Placeholder
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success('User deleted successfully.');
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: newStatus } : u
    ));
    toast.success(`User status changed to ${newStatus}.`);
  };

  const handleSaveUser = () => {
    if (!newName || !newEmail) {
      toast.error('Please fill out all fields.');
      return;
    }

    if (editingUserId) {
      // Edit User
      const updateUser = async () => {
        const updated = await userService.updateUser(editingUserId, { name: newName, email: newEmail, role: newRole });
        setUsers(users.map(u => u.id === editingUserId ? updated : u));
        toast.success('User updated successfully!');
      };
      updateUser();
    } else {
      // Add New User
      if (!newPassword) {
         toast.error('Password is required for new users.');
         return;
      }
      const saveUser = async () => {
        const newUser = await userService.addUser({ 
          name: newName, 
          email: newEmail, 
          role: newRole,
          password: newPassword
        });
        setUsers([newUser, ...users]);
        toast.success(`${newName} added successfully!`);

        dispatch(addNotification({
          title: 'New System User',
          message: `Admin added ${newName} to the active directory.`,
          targetRole: 'Admin'
        }));
      };
      saveUser();
    }

    // Close Modal
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User Management</h2>
        <Button onClick={openAddModal}>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading users...</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                         <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                            <img src={user.avatar} alt="avatar" />
                         </div>
                         <span className="font-medium text-slate-800 dark:text-slate-100">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-slate-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="primary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)} 
                        className="focus:outline-none hover:opacity-80 transition-opacity"
                        title="Click to toggle status"
                      >
                        <Badge variant={user.status === 'Active' ? 'success' : 'default'} className="cursor-pointer">
                          {user.status}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} className="h-8 w-8 p-0">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUserId ? "Edit User" : "Add New User"}>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter full name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div>
            <Label>Role</Label>
            <select 
              value={newRole} 
              onChange={e => setNewRole(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Worker</option>
              <option>Inventory Manager</option>
              <option>Sales Manager</option>
            </select>
          </div>
          {!editingUserId && (
            <div>
              <Label>Account Password</Label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Set secure password" 
              />
            </div>
          )}
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>{editingUserId ? "Update User" : "Save User"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
