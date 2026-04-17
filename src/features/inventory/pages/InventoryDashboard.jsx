import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, AlertTriangle, History, ArrowUpRight, Plus, Activity, Boxes } from 'lucide-react';
import { inventoryService } from '../../../services/inventoryService';
import { Button } from '../../../components/ui/Button';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      const invData = await inventoryService.getInventory();
      const logData = await inventoryService.getUsageLogs();
      setInventory(invData);
      setLogs(logData.slice(0, 5));
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length,
    totalQuantity: inventory.reduce((acc, curr) => acc + curr.quantity, 0),
    categories: [...new Set(inventory.map(i => i.category))].length
  };

  const chartData = [...new Set(inventory.map(i => i.category))].map(cat => ({
    name: cat,
    quantity: inventory.filter(i => i.category === cat).reduce((acc, curr) => acc + curr.quantity, 0)
  })).sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Inventory Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of warehouse stock and material movements</p>
        </div>
        <div className="flex space-x-2">
           <Button variant="outline" onClick={() => navigate('/inventory/logs')} className="hidden sm:flex items-center">
             <History size={16} className="mr-2" /> View Logs
           </Button>
           <Button onClick={() => navigate('/inventory')} className="flex items-center">
             <Plus size={16} className="mr-2" /> Add Material
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Skus" value={stats.totalItems} icon={<Boxes className="text-blue-500" />} />
        <StatCard title="Low Stock Alerts" value={stats.lowStock} subtitle="Immediate action required" icon={<AlertTriangle className={stats.lowStock > 0 ? "text-red-500 animate-pulse" : "text-slate-400"} />} />
        <StatCard title="Total Stock Volume" value={stats.totalQuantity.toLocaleString()} icon={<Package className="text-indigo-500" />} />
        <StatCard title="Active Categories" value={stats.categories} icon={<Activity className="text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle>Stock Distribution by Category</CardTitle>
             <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Quantity per Type</div>
          </CardHeader>
          <CardContent>
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={80} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc' }}
                    />
                    <Bar dataKey="quantity" radius={[0, 4, 4, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-1 h-full">
           <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <History size={18} className="mr-2 text-primary-500" />
                  Recent Movements
                </CardTitle>
                <ArrowUpRight size={16} className="text-slate-400" />
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {logs.map((log) => (
                   <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold uppercase border px-1.5 py-0.5 rounded ${
                          log.type === 'Restock' ? 'border-green-200 text-green-600 bg-green-50' : 'border-amber-200 text-amber-600 bg-amber-50'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{log.item}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {log.type === 'Restock' ? '+' : '-'}{log.quantity} {log.unit} - {log.actionBy}
                      </p>
                   </div>
                 ))}
              </div>
              <div className="p-4">
                 <Button variant="ghost" className="w-full text-xs" onClick={() => navigate('/inventory/logs')}>
                   View Full Audit Trail
                 </Button>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-tight">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default InventoryDashboard;
