import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { Shield, Bell, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Account Settings</h2>
        <p className="text-slate-500 mt-1">Manage your security and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <Shield size={20} />
            </div>
            <CardTitle>Security & Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit">Update Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Bell size={20} />
            </div>
            <CardTitle>Application Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
               <div>
                 <p className="font-medium text-slate-800">New Task Alerts</p>
                 <p className="text-sm text-slate-500">Receive notifications when a new task is assigned.</p>
               </div>
               <div className="h-6 w-11 bg-primary-600 rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
               </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
               <div>
                 <p className="font-medium text-slate-800">Deadline Reminders</p>
                 <p className="text-sm text-slate-500">Auto-ping when a task is due in 24 hours.</p>
               </div>
               <div className="h-6 w-11 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
