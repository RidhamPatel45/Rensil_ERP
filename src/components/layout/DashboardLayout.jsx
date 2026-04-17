import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, Users, CheckSquare, Settings, Clock, ClipboardList, Package, History, ShoppingCart, PlusCircle, LogOut, User, Settings as SettingsIcon, ChevronDown, BarChart3, Activity, IndianRupee } from 'lucide-react';
import { NotificationPanel } from '../ui/NotificationPanel';
import { ThemeToggle } from '../ui/ThemeToggle';
import { logoutUser } from '../../store/authSlice';
import { useTheme } from '../../hooks/useTheme';
import clsx from 'clsx';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navClasses = ({ isActive }) => clsx(
    "flex items-center rounded-lg mt-2 text-sm font-medium transition-all duration-200",
    isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3",
    isActive 
      ? "bg-slate-800 dark:bg-primary-900/50 text-primary-400" 
      : "text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800/50 hover:text-white"
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={clsx(
        "bg-slate-900 text-white p-4 hidden md:flex flex-col transition-all duration-300 ease-in-out relative border-r border-slate-800",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 bg-primary-600 text-white rounded-full p-1 shadow-lg hover:bg-primary-500 transition-colors z-50 border-2 border-slate-900"
        >
          {isCollapsed ? <ChevronDown size={14} className="-rotate-90" /> : <ChevronDown size={14} className="rotate-90" />}
        </button>

        {/* Logo */}
        <div className={clsx("mb-8 px-4 flex items-center transition-all", isCollapsed && "px-1 justify-center")}>
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0">R</div>
          {!isCollapsed && <span className="ml-3 text-xl font-bold text-white tracking-tight truncate">Rug Factory</span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {user?.role === 'Admin' && (
            <>
              {!isCollapsed && <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4 opacity-70">Admin Controls</p>}
              <NavLink to="/admin" end className={navClasses} title={isCollapsed ? "Dashboard" : ""}>
                <LayoutDashboard size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Dashboard</span>}
              </NavLink>
              <NavLink to="/admin/users" className={navClasses} title={isCollapsed ? "User Management" : ""}>
                <Users size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>User Management</span>}
              </NavLink>
              <NavLink to="/admin/approvals" className={navClasses} title={isCollapsed ? "Approvals" : ""}>
                <CheckSquare size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Approvals</span>}
              </NavLink>
              <NavLink to="/admin/audit-logs" className={navClasses} title={isCollapsed ? "Audit Logs" : ""}>
                <History size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Audit Logs</span>}
              </NavLink>
              <NavLink to="/admin/financials" className={navClasses} title={isCollapsed ? "Financials" : ""}>
                <BarChart3 size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Financials</span>}
              </NavLink>
              <NavLink to="/admin/efficiency" className={navClasses} title={isCollapsed ? "Efficiency" : ""}>
                <Activity size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Efficiency</span>}
              </NavLink>
              <NavLink to="/admin/salaries" className={navClasses} title={isCollapsed ? "Payroll" : ""}>
                <IndianRupee size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Payroll</span>}
              </NavLink>
            </>
          )}

          {user?.role === 'Manager' && (
            <>
              {!isCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Manager Controls</p>}
              <NavLink to="/manager" end className={navClasses} title={isCollapsed ? "Dashboard" : ""}>
                <LayoutDashboard size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Dashboard</span>}
              </NavLink>
              <NavLink to="/manager/tasks" className={navClasses} title={isCollapsed ? "Task Assignment" : ""}>
                <CheckSquare size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Task Assignment</span>}
              </NavLink>
              <NavLink to="/manager/approvals" className={navClasses} title={isCollapsed ? "Approvals" : ""}>
                <CheckSquare size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Approvals</span>}
              </NavLink>
              <NavLink to="/manager/salary" className={navClasses} title={isCollapsed ? "My Salary" : ""}>
                <IndianRupee size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>My Salary</span>}
              </NavLink>
              <NavLink to="/manager/deadlines" className={navClasses} title={isCollapsed ? "Deadlines" : ""}>
                <Clock size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Deadlines</span>}
              </NavLink>
            </>
          )}

          {user?.role === 'Worker' && (
            <>
              {!isCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Worker Controls</p>}
              <NavLink to="/worker/tasks" className={navClasses} title={isCollapsed ? "My Tasks" : ""}>
                <ClipboardList size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>My Tasks</span>}
              </NavLink>
              <NavLink to="/worker/approvals" className={navClasses} title={isCollapsed ? "Approvals" : ""}>
                <CheckSquare size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Approvals</span>}
              </NavLink>
              <NavLink to="/worker/salary" className={navClasses} title={isCollapsed ? "My Salary" : ""}>
                <IndianRupee size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>My Salary</span>}
              </NavLink>
            </>
          )}

          {user?.role === 'Inventory Manager' && (
            <>
              {!isCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Inventory Controls</p>}
              <NavLink to="/inventory" end className={navClasses} title={isCollapsed ? "Dashboard" : ""}>
                <LayoutDashboard size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Dashboard</span>}
              </NavLink>
              <NavLink to="/inventory/stock" className={navClasses} title={isCollapsed ? "Stock Overview" : ""}>
                <Package size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Stock Overview</span>}
              </NavLink>
              <NavLink to="/inventory/approvals" className={navClasses} title={isCollapsed ? "Approvals" : ""}>
                <CheckSquare size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Approvals</span>}
              </NavLink>
              <NavLink to="/inventory/salary" className={navClasses} title={isCollapsed ? "My Salary" : ""}>
                <IndianRupee size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>My Salary</span>}
              </NavLink>
              <NavLink to="/inventory/logs" className={navClasses} title={isCollapsed ? "Usage Logs" : ""}>
                <History size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Usage Logs</span>}
              </NavLink>
            </>
          )}

          {user?.role === 'Sales Manager' && (
            <>
              {!isCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Sales Controls</p>}
              <NavLink to="/sales" end className={navClasses} title={isCollapsed ? "Dashboard" : ""}>
                <LayoutDashboard size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Dashboard</span>}
              </NavLink>
              <NavLink to="/sales/orders" className={navClasses} title={isCollapsed ? "Manage Orders" : ""}>
                <ShoppingCart size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Manage Orders</span>}
              </NavLink>
              <NavLink to="/sales/approvals" className={navClasses} title={isCollapsed ? "Approvals" : ""}>
                <CheckSquare size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Approvals</span>}
              </NavLink>
              <NavLink to="/sales/salary" className={navClasses} title={isCollapsed ? "My Salary" : ""}>
                <IndianRupee size={18} className={clsx(!isCollapsed && "mr-3")} />
                {!isCollapsed && <span>My Salary</span>}
              </NavLink>
            </>
          )}
        </nav>

        {!isCollapsed && (
          <div className="mt-auto px-4 py-4 border-t border-slate-800 animate-in fade-in duration-500">
             <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Logged in as</p>
             <p className="font-bold text-sm text-primary-400 truncate">{user?.role || 'Guest'}</p>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 sticky top-0 transition-colors duration-300">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex-1 truncate">Rug Factory System</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <NotificationPanel />
            
            <div className="relative border-l pl-4 border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="profile" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">{user?.role}</p>
                </div>
                <ChevronDown size={14} className={clsx("text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        <img src={user?.avatar} alt="avatar" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>
                   </div>
                   <div className="p-2">
                     <NavLink 
                        to="/profile" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 rounded-lg transition-colors"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </NavLink>
                      <NavLink 
                        to="/settings" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 rounded-lg transition-colors"
                      >
                        <SettingsIcon size={16} />
                        <span>Account Settings</span>
                      </NavLink>
                   </div>
                   <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 scroll-smooth transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
