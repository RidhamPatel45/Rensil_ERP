import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, LayoutDashboard, ShoppingCart, Truck, PlusCircle, Settings, History, ArrowUpRight, Activity, IndianRupee, AlertTriangle, Package, TrendingUp, User } from 'lucide-react';
import { auditService } from '../../../services/auditService';
import { inventoryService } from '../../../services/inventoryService';
import { orderService } from '../../../services/orderService';
import { Button } from '../../../components/ui/Button';

const mockData = [
  { name: 'Mon', rugs: 40 },
  { name: 'Tue', rugs: 30 },
  { name: 'Wed', rugs: 55 },
  { name: 'Thu', rugs: 45 },
  { name: 'Fri', rugs: 60 },
  { name: 'Sat', rugs: 25 },
  { name: 'Sun', rugs: 10 },
];

const CHART_COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

// Helper for sales trend (simple version)
const trendDataFromOrders = (orders) => {
  return [
    { name: 'Mon', revenue: 1200 },
    { name: 'Tue', revenue: 2100 },
    { name: 'Wed', revenue: 1800 },
    { name: 'Thu', revenue: 3400 },
    { name: 'Fri', revenue: 2800 },
    { name: 'Sat', revenue: 4200 },
    { name: 'Sun', revenue: 1500 },
  ];
};

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    inventoryAlerts: 0,
    users: 1248 
  });
  const navigate = useNavigate();

  const parseCurrency = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    return parseFloat(str.replace(/[₹$,]/g, '')) || 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      const [allLogs, ordersData, lowStock, invData] = await Promise.all([
        auditService.getLogs(),
        orderService.getOrders(),
        inventoryService.getLowStockItems(),
        inventoryService.getInventory()
      ]);

      const totalRevenue = ordersData.reduce((acc, curr) => acc + parseCurrency(curr.amount), 0);
      
      setLogs(allLogs.slice(0, 4));
      setOrders(ordersData);
      setInventory(invData);
      setStats(prev => ({
        ...prev,
        revenue: totalRevenue,
        orders: ordersData.length,
        inventoryAlerts: lowStock.length
      }));
    };
    fetchData();
  }, []);

  const inventoryChartData = [...new Set(inventory.map(i => i.category))].map(cat => ({
    name: cat,
    value: inventory.filter(i => i.category === cat).reduce((acc, curr) => acc + curr.quantity, 0)
  }));

  const realizedSalesData = trendDataFromOrders(orders);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h2>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border dark:border-slate-700">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<IndianRupee className="text-emerald-500" />} />
        <StatCard title="Total Orders" value={stats.orders} icon={<ShoppingCart className="text-blue-500" />} />
        <StatCard title="Inventory Alerts" value={stats.inventoryAlerts} subtitle="Low Stock/Critical items" icon={<AlertTriangle className={stats.inventoryAlerts > 0 ? "text-red-500 animate-pulse" : "text-slate-400"} />} />
        <StatCard title="Total Users" value={stats.users.toLocaleString()} icon={<Users className="text-indigo-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts & Quick Actions (Column Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card className="border-none shadow-sm bg-primary-600 dark:bg-primary-900/40 text-white overflow-hidden">
             <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold">Quick Actions</h3>
                        <p className="text-primary-100 dark:text-primary-300 text-sm">Common administrative operations</p>
                    </div>
                    <ArrowUpRight className="text-primary-200 opacity-50" size={32} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ActionButton icon={<Users size={18} />} label="New User" onClick={() => navigate('/admin/users')} />
                    <ActionButton icon={<Settings size={18} />} label="Account Settings" onClick={() => navigate('/settings')} />
                    <ActionButton icon={<User size={18} />} label="My Profile" onClick={() => navigate('/profile')} />
                    <ActionButton icon={<History size={18} />} label="View Logs" onClick={() => navigate('/admin/audit-logs')} />
                </div>
             </CardContent>
          </Card>

          {/* Production Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Production Volume</CardTitle>
              <Activity className="text-primary-500" size={18} />
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="rugs" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                   <CardTitle className="text-base">Stock Distribution</CardTitle>
                   <Package className="text-amber-500" size={16} />
                </CardHeader>
                <CardContent>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {inventoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {inventoryChartData.slice(0, 3).map((item, i) => (
                        <div key={item.name} className="flex items-center space-x-1.5">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                           <span className="text-[10px] text-slate-500 font-bold uppercase">{item.name}</span>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                   <CardTitle className="text-base">Revenue Trend</CardTitle>
                   <TrendingUp className="text-emerald-500" size={16} />
                </CardHeader>
                <CardContent>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={realizedSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAdminSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAdminSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Growth Indicator</span>
                      <span className="text-[10px] font-black text-emerald-600 font-mono">+18.5%</span>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Business Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
             <Card className="border-l-4 border-amber-500 bg-amber-50/10 dark:bg-amber-900/5">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-bold flex items-center">
                      <Package size={16} className="mr-2 text-amber-500" />
                      Inventory Health
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500">Critical Stock Alerts</span>
                         <span className="font-bold text-red-500">{stats.inventoryAlerts} Items</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                         <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/inventory')}>
                         Open Warehouse Manager
                      </Button>
                   </div>
                </CardContent>
             </Card>

             <Card className="border-l-4 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/5">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-bold flex items-center">
                      <IndianRupee size={16} className="mr-2 text-emerald-500" />
                      Revenue Breakdown
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500">Total Revenue Generated</span>
                         <span className="font-black text-slate-900 dark:text-slate-100 uppercase">₹{stats.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-800/30">
                         <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-tighter">Target Achievement</span>
                         <span className="text-emerald-600 font-black">92%</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/sales/orders')}>
                         Analyze Performance
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Right: Activity Feed (Column Span 1) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b dark:border-slate-800">
               <div className="flex items-center space-x-2">
                 <History className="text-primary-600 dark:text-primary-400" size={18} />
                 <CardTitle>System Activity</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden text-center">
               <div className="divide-y dark:divide-slate-800">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] uppercase font-black tracking-widest text-primary-600 dark:text-primary-400">
                            {log.module}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                             {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{log.action}</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed italic">
                         {log.description}
                       </p>
                    </div>
                  ))}
               </div>
               <div className="p-4">
                  <Button variant="ghost" className="w-full text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => navigate('/admin/audit-logs')}>
                    View All Activity
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center space-y-2 p-3 bg-white/10 hover:bg-white/20 dark:bg-slate-100/5 dark:hover:bg-slate-100/10 rounded-xl transition-all border border-white/10 w-full"
    >
        <div className="p-2 bg-white/10 rounded-lg">
            {icon}
        </div>
        <span className="text-xs font-semibold">{label}</span>
    </button>
);

const StatCard = ({ title, value, subtitle, icon }) => (
  <Card>
    <CardContent className="p-6 pb-4">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</h3>
          </div>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AdminDashboard;
