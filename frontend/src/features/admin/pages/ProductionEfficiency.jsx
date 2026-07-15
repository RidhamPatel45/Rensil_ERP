import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, Users, Target, Activity } from 'lucide-react';
import { reportService } from '../../../services/reportService';

const ProductionEfficiency = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await reportService.getEfficiencyData();
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-medium animate-pulse uppercase tracking-widest">Crunching Performance Data...</div>;

  const statusData = [
    { name: 'Completed', value: data.summary.completed, color: '#10b981' },
    { name: 'In Progress', value: data.summary.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: data.summary.pending, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Production Efficiency</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time operational health and worker output metrics</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <Activity size={16} className="text-green-500 animate-pulse" />
           <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">System Health: <span className="text-green-600">Optimal</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Success Rate" value={data.summary.successRate} icon={<Target className="text-primary-600" />} color="bg-primary-50 dark:bg-primary-900/20" />
        <StatCard title="Active Tasks" value={data.summary.inProgress} icon={<Clock className="text-blue-600" />} color="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard title="Completed" value={data.summary.completed} icon={<CheckCircle2 className="text-green-600" />} color="bg-green-50 dark:bg-green-900/20" />
        <StatCard title="Bottlenecks" value="2" subtitle="High-priority delays" icon={<AlertTriangle className="text-red-600" />} color="bg-red-50 dark:bg-red-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
           <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 pb-6">
             <div className="flex justify-between items-center">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 italic">Worker Performance Metrics</CardTitle>
               <div className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-400">Actual vs Target</div>
             </div>
           </CardHeader>
           <CardContent className="pt-8">
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={data.performance} 
                   margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                   barGap={8}
                 >
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.05} />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#94a3b8', fontSize: 10}} 
                   />
                   <Tooltip 
                     cursor={{fill: 'rgba(148, 163, 184, 0.05)'}} 
                     contentStyle={{
                       borderRadius: '16px', 
                       border: 'none', 
                       boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                       backgroundColor: '#111827',
                       color: '#f8fafc'
                     }} 
                   />
                   <Legend 
                     verticalAlign="top" 
                     align="right" 
                     iconType="circle"
                     content={({ payload }) => (
                       <div className="flex space-x-4 mb-4">
                         {payload.map((entry, index) => (
                           <div key={`item-${index}`} className="flex items-center space-x-2">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{entry.value}</span>
                           </div>
                         ))}
                       </div>
                     )}
                   />
                   <Bar 
                     dataKey="completed" 
                     name="Completed" 
                     fill="#3b82f6" 
                     radius={[6, 6, 0, 0]} 
                     barSize={28}
                   />
                   <Bar 
                     dataKey="total" 
                     name="Total Assigned" 
                     fill="#94a3b8" 
                     fillOpacity={0.2}
                     radius={[6, 6, 0, 0]} 
                     barSize={28}
                   />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
           <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 pb-6">
             <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 italic">Workload Distribution</CardTitle>
           </CardHeader>
           <CardContent className="pt-4">
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={statusData}
                       cx="50%"
                       cy="50%"
                       innerRadius={65}
                       outerRadius={90}
                       paddingAngle={10}
                       dataKey="value"
                       stroke="none"
                     >
                       {statusData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#111827', color: '#fff'}}
                     />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-6 space-y-2">
                {statusData.map((item) => (
                   <div key={item.name} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 transition-all hover:scale-[1.02]">
                      <div className="flex items-center space-x-3">
                         <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{backgroundColor: item.color}}></div>
                         <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider font-mono">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">{item.value}</span>
                   </div>
                ))}
             </div>
           </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 pb-6">
           <div className="flex items-center space-x-2">
              <Users size={18} className="text-primary-500" />
              <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 italic">Staff Efficiency Table</CardTitle>
           </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase text-[9px] font-black tracking-widest border-y border-slate-100 dark:border-slate-800">
                    <tr>
                       <th className="px-6 py-5">Worker Name</th>
                       <th className="px-6 py-5 text-center">Active Tasks</th>
                       <th className="px-6 py-5 text-center">Total Assigned</th>
                       <th className="px-6 py-5 text-right">Completion Rate</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.performance.map(p => (
                      <tr key={p.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                         <td className="px-6 py-5 font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter text-base">{p.name}</td>
                         <td className="px-6 py-5 text-center text-slate-600 dark:text-slate-400 font-bold">{p.total - p.completed}</td>
                         <td className="px-6 py-5 text-center text-slate-600 dark:text-slate-400 font-bold">{p.total}</td>
                         <td className="px-6 py-5 text-right">
                            <div className="inline-flex items-center text-primary-600 dark:text-primary-400 font-black bg-primary-100/50 dark:bg-primary-900/20 px-4 py-1.5 rounded-full text-xs shadow-sm shadow-primary-500/10 italic">
                               {Math.floor((p.completed/(p.total || 1))*100)}%
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:scale-[1.01] transition-transform">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-2xl shadow-inner ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic">{value}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold italic mt-1">{subtitle}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProductionEfficiency;
