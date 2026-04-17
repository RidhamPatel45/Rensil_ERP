import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex bg-slate-950 relative overflow-hidden">
      {/* Immersive Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 animate-pulse-slow active:scale-100 transition-transform duration-[20s]"
        style={{ backgroundImage: 'url("/assets/login-bg.png")' }}
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950/90 via-slate-950/50 to-transparent" />
      <div className="absolute inset-0 z-10 bg-slate-950/20 backdrop-blur-[2px]" />

      <div className="relative z-20 w-full flex flex-col md:flex-row">
        {/* Brand Side (Desktop) */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center px-16 lg:px-24">
           <div className="max-w-md animate-in slide-in-from-left duration-1000">
              <div className="w-12 h-1 bg-primary-500 mb-8 rounded-full shadow-[0_0_15px_rgba(235,31,73,0.5)]" />
              <h2 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter uppercase mb-6 italic">
                The Art of <br />
                <span className="text-primary-500 drop-shadow-sm">Modern</span> <br />
                Weaving.
              </h2>
              <p className="text-slate-300 text-lg lg:text-xl font-medium leading-relaxed opacity-80 border-l-2 border-slate-800 pl-6">
                Precision management for the world's most <br />
                exquisite artisanal rugs.
              </p>
           </div>
        </div>

        {/* Form Side */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[420px] animate-in slide-in-from-bottom md:slide-in-from-right duration-700">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
