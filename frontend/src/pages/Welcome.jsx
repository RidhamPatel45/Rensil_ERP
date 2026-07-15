import React from 'react';

const Welcome = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to Rensil-ERP System</h2>
      <p className="text-slate-600">
        You are currently in the Setup & Architecture phase.
        Use the dropdown in the top right to switch roles.
        More features will appear here as we complete each module.
      </p>
    </div>
  );
};

export default Welcome;
