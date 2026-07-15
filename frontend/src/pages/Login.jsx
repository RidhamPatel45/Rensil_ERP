import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { loginUser } from '../store/authSlice';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const from = location.state?.from?.pathname || "/admin";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await userService.login(email, password);
      dispatch(loginUser(user));
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
      
      <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="mb-10 text-center md:text-left">
           <div className="inline-flex items-center space-x-2 text-primary-500 mb-2">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Verified Portal</span>
           </div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
              Rug Factory <span className="text-primary-500">System</span>
           </h1>
           <p className="text-slate-400 text-sm font-medium mt-1">Authorized Gateway Control</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300 text-[11px] font-black uppercase tracking-widest ml-1">Work Email</Label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
              <Input 
                id="email"
                type="email" 
                placeholder="name@rugfactory.com" 
                className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:ring-primary-500/30 focus:border-primary-500/50 transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-between items-center px-1">
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Enter corporate credentials</p>
               <span className="text-[9px] text-primary-500 font-black cursor-pointer hover:underline opacity-50">admin@rugfactory.com</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-slate-300 text-[11px] font-black uppercase tracking-widest">Access Key</Label>
              <button type="button" className="text-[10px] text-slate-500 hover:text-primary-500 font-black uppercase transition-colors">Recover?</button>
            </div>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
              <Input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="h-12 pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:ring-primary-500/30 focus:border-primary-500/50 transition-all outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-between items-center px-1">
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Security encrypted field</p>
               <span className="text-[9px] text-primary-500 font-black cursor-pointer hover:underline opacity-50">admin123</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase text-base rounded-2xl shadow-xl shadow-primary-900/20 hover:scale-[1.01] active:scale-[0.98] transition-all relative overflow-hidden group/btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Validating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Access System
                <div className="ml-2 w-0 group-hover/btn:w-4 overflow-hidden transition-all duration-300">
                   <Lock size={16} />
                </div>
              </div>
            )}
          </Button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-white/5">
          <div className="flex items-center justify-center space-x-4">
             <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
             </div>
             <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] leading-tight">
               Enterprise Grade Security <br />
               <span className="text-slate-600 font-bold">256-BIT ENCRYPTION</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
