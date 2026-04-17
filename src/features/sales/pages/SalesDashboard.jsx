import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShoppingBag, IndianRupee, TrendingUp, Clock, ArrowUpRight, Plus, Eye, Receipt } from 'lucide-react';
import { orderService } from '../../../services/orderService';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const SalesDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await orderService.getOrders();
      setOrders(data);
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  const parseCurrency = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    // Remove symbols and commas, then parse
    return parseFloat(str.replace(/[₹$,]/g, '')) || 0;
  };

  const stats = {
    totalRevenue: orders.reduce((acc, curr) => acc + parseCurrency(curr.amount), 0),
    paidRevenue: orders.filter(o => o.paymentStatus === 'Paid').reduce((acc, curr) => acc + parseCurrency(curr.amount), 0),
    orderCount: orders.length,
    pendingPayments: orders.filter(o => o.paymentStatus === 'Pending').length,
    avgOrderValue: orders.length > 0 ? (orders.reduce((acc, curr) => acc + parseCurrency(curr.amount), 0) / orders.length).toFixed(0) : 0
  };

  // Mock trend data for chart
  const trendData = [
    { day: 'Mon', sales: 1200, orders: 4 },
    { day: 'Tue', sales: 2100, orders: 6 },
    { day: 'Wed', sales: 1800, orders: 5 },
    { day: 'Thu', sales: 3400, orders: 9 },
    { day: 'Fri', sales: 2800, orders: 7 },
    { day: 'Sat', sales: 4200, orders: 11 },
    { day: 'Sun', sales: 1500, orders: 4 },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sales Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track revenue performance and order fulfillment</p>
        </div>
        <div className="flex space-x-2">
           <Button variant="outline" onClick={() => navigate('/sales/orders')} className="hidden sm:flex items-center">
             <Receipt size={16} className="mr-2" /> View All Orders
           </Button>
           
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          subtitle={`Paid: ₹${stats.paidRevenue.toLocaleString()}`} 
          icon={<IndianRupee className="text-emerald-500" />} 
        />
        <StatCard 
          title="Orders Placed" 
          value={stats.orderCount} 
          subtitle="This billing cycle" 
          icon={<ShoppingBag className="text-blue-500" />} 
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`₹${stats.avgOrderValue.toLocaleString()}`} 
          icon={<TrendingUp className="text-indigo-500" />} 
        />
        <StatCard 
          title="Pending Payments" 
          value={stats.pendingPayments} 
          icon={<Clock className="text-amber-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle>Weekly Revenue Trend</CardTitle>
             <div className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">
               <TrendingUp size={12} className="mr-1" /> +12% vs LW
             </div>
          </CardHeader>
          <CardContent>
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        {/* Recent Orders List */}
        <Card className="lg:col-span-1 h-full">
           <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <ShoppingBag size={18} className="mr-2 text-primary-500" />
                  Recent Orders
                </CardTitle>
                <ArrowUpRight size={16} className="text-slate-400" />
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {recentOrders.map((order) => (
                   <div key={order.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/sales/orders/${order.id}`)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">#{order.id}</span>
                        <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{order.customer || 'Unknown Customer'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">{order.amount}</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">{order.datePlacement || order.datePlaced}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-4 pt-2">
                 <Button variant="ghost" className="w-full text-xs text-primary-600 font-bold" onClick={() => navigate('/sales/orders')}>
                   View All Sales Activity
                 </Button>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon }) => (
  <Card className="hover:shadow-md transition-all duration-300 relative overflow-hidden group border-slate-200 dark:border-slate-800">
    <CardContent className="p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 z-10 transition-colors group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10">
            {React.cloneElement(icon, { size: 20 })}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-3 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SalesDashboard;
