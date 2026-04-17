import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Wallet, ReceiptText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { reportService } from '../../../services/reportService';

const FinancialAnalytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await reportService.getFinancialData();
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Calculating financials...</div>;

  const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Financial Performance</h2>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Fiscal Period: March 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={data.kpis.totalRevenue} trend="+12.5%" isUp={true} icon={<DollarSign className="text-primary-600" />} />
        <StatCard title="Total Collected" value={data.kpis.paidRevenue} subtitle="Paid Orders" icon={<Wallet className="text-green-600" />} />
        <StatCard title="GST Liability" value={data.kpis.gstCollected} subtitle="Current Tax (18%)" icon={<ReceiptText className="text-orange-600" />} />
        <StatCard title="Gross Margin" value={data.kpis.grossMargin} trend="-2%" isUp={false} icon={<TrendingUp className="text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs. Cost Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9'}} activeDot={{r: 8}} />
                    <Line type="monotone" dataKey="costs" name="Total Costs (₹)" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4, fill: '#ef4444'}} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
             <CardTitle>Payment Status</CardTitle>
           </CardHeader>
           <CardContent className="flex flex-col items-center">
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: parseInt(data.kpis.paidRevenue.replace(/[^0-9]/g, '')) },
                        { name: 'Pending', value: parseInt(data.kpis.pendingRevenue.replace(/[^0-9]/g, '')) }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-full space-y-2 mt-4">
                <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Paid</div>
                   <span className="font-bold">{data.kpis.paidRevenue}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div> Pending</div>
                   <span className="font-bold">{data.kpis.pendingRevenue}</span>
                </div>
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, trend, isUp, icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          {icon}
        </div>
        {trend && (
           <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'}`}>
              {isUp ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
              {trend}
           </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 tracking-tight">{subtitle}</p>}
      </div>
    </CardContent>
  </Card>
);

export default FinancialAnalytics;
