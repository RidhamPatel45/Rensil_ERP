import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import RequestApprovalModal from '../../../components/ui/RequestApprovalModal';

const performanceData = [
  { week: 'W1', efficiency: 85 },
  { week: 'W2', efficiency: 88 },
  { week: 'W3', efficiency: 92 },
  { week: 'W4', efficiency: 90 },
];

const ManagerDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { requests } = useSelector((state) => state.approvals);
  const navigate = useNavigate();

  const recentRequests = requests
    .filter(req => req.requestedBy === user?.name)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Production Dashboard</h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2"
        >
          <PlusCircle size={18} />
          <span>Request Approval</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Tasks" value="24" subtitle="4 Overdue" icon={<Briefcase className="text-amber-500" />} />
        <StatCard title="Tasks Completed" value="142" subtitle="This month" icon={<CheckCircle className="text-green-500" />} />
        <StatCard title="Avg Completion Time" value="3.2 Days" icon={<Clock className="text-blue-500" />} />
      </div>

      <RequestApprovalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Efficiency Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Efficiency (Last 4 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} domain={[50, 100]} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Line type="monotone" dataKey="efficiency" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Approvals Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Requests</CardTitle>
            <CheckCircle size={16} className="text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {recentRequests.length === 0 ? (
                 <p className="text-sm text-slate-500 text-center py-4">No recent requests.</p>
               ) : (
                 recentRequests.map(req => (
                   <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{req.id}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{req.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">{req.date}</p>
                   </div>
                 ))
               )}
               <Button 
                variant="ghost" 
                className="w-full text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 mt-2"
                onClick={() => navigate('/manager/approvals')}
               >
                 View All Requests
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ManagerDashboard;
