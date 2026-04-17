import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { updateUser } from '../store/authSlice';
import toast from 'react-hot-toast';
import { User, Mail, Briefcase, Camera } from 'lucide-react';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateProfile = () => {
    dispatch(updateUser({ name, email }));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>
          <p className="text-slate-500 mt-1">Manage your personal information and presence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center flex flex-col items-center">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-primary-600 text-white rounded-full shadow-md hover:bg-primary-700 transition-all opacity-0 group-hover:opacity-100">
                <Camera size={16} />
              </button>
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-800">{user?.name}</h3>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{user?.role}</p>
            
            <div className="mt-8 w-full space-y-3">
               <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg text-left">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-600 truncate">{user?.email}</span>
               </div>
               <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg text-left">
                  <Briefcase size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-600">{user?.role}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    disabled={!isEditing}
                    className={!isEditing ? "bg-slate-50 border-transparent shadow-none" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={!isEditing}
                    className={!isEditing ? "bg-slate-50 border-transparent shadow-none" : ""}
                  />
                </div>
             </div>

             <div className="space-y-2">
                <Label>Biography</Label>
                <textarea 
                  rows={4}
                  className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:border-transparent disabled:shadow-none"
                  placeholder="Tell us about yourself..."
                  disabled={!isEditing}
                  defaultValue="Dedicated employee at Rug Factory. Focused on quality production and system efficiency."
                />
             </div>

             <div className="pt-4 flex justify-end space-x-3">
               {isEditing ? (
                 <>
                   <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                   <Button onClick={handleUpdateProfile}>Save Changes</Button>
                 </>
               ) : (
                 <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
