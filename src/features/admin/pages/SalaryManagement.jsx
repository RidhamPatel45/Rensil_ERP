import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Download,
  MoreVertical,
  Banknote,
  IndianRupee,
  Activity,
  ArrowRight
} from 'lucide-react';
import { salaryService } from '../../../services/salaryService';
import toast from 'react-hot-toast';

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllSalaries = async () => {
      const data = await salaryService.getAllSalaries();
      setSalaries(data);
      setIsLoading(false);
    };
    fetchAllSalaries();
  }, []);

  const handlePaySalary = async (userId) => {
    const res = await salaryService.updatePaymentStatus(userId, 'Paid');
    if (res.success) {
      setSalaries(prev => prev.map(s => s.userId === userId ? { ...s, paymentStatus: 'Paid' } : s));
      toast.success('Payout processed successfully!');
    }
  };

  const totalPayroll = salaries.reduce((acc, curr) => {
    const val = parseInt(curr.netSalary.replace(/[₹,]/g, '')) || 0;
    return acc + val;
  }, 0);

  const pendingCount = salaries.filter(s => s.paymentStatus === 'Pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Payroll Hub</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage wages, incentives, and payout status across departments</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="outline" className="hidden sm:flex items-center shadow-sm">
             <Download size={16} className="mr-2" /> Export Report
           </Button>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Monthly Payroll" value={`₹${(totalPayroll/100000).toFixed(1)}L`} icon={<IndianRupee className="text-primary-500" />} />
        <SummaryCard title="Pending Payouts" value={pendingCount} icon={<AlertCircle className={pendingCount > 0 ? "text-amber-500" : "text-slate-400"} />} />
        <SummaryCard title="Tax Deductions" value="₹24.5K" icon={<Activity className="text-indigo-500" />} />
        <SummaryCard title="Efficiency Bonus" value="₹62K" icon={<CheckCircle className="text-emerald-500" />} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-row items-center justify-between">
           <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search employee..." 
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none rounded-xl focus:ring-1 focus:ring-primary-500 transition-all outline-none"
              />
           </div>
           <Button variant="ghost" size="sm" className="hidden sm:flex items-center text-slate-500">
             <Filter size={16} className="mr-2" /> Filters
           </Button>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Employee</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Work Detail</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Net Salary</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {salaries.map((s) => (
                      <tr key={s.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                               <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50">
                                  {s.userName.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none mb-1">{s.userName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{s.role}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            {s.workDetails ? (
                              <button 
                                onClick={() => { setSelectedUser(s); setIsDetailModalOpen(true); }}
                                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-1.5 rounded-full font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-all flex items-center mx-auto"
                              >
                                {s.workDetails.metric}: {s.workDetails.value} <ArrowRight size={10} className="ml-1.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-300 italic">No Metrics</span>
                            )}
                         </td>
                         <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-none mb-1">{s.netSalary}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-tight">Incl. {s.bonuses} Bonus</p>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <Badge variant={s.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                               {s.paymentStatus}
                            </Badge>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => { setSelectedUser(s); setIsDetailModalOpen(true); }} 
                                 className="h-8 w-8 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                               >
                                  <Eye size={16} />
                               </Button>
                               {s.paymentStatus === 'Pending' && (
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   onClick={() => handlePaySalary(s.userId)}
                                   className="text-[10px] font-bold uppercase border-primary-500/50 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                 >
                                   Pay
                                 </Button>
                               )}
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <MoreVertical size={16} />
                               </Button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>

      {/* Salary Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500 scale-95 md:scale-100">
              <div className="p-8 pb-4 flex justify-between items-start">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Earnings Breakdown</h3>
                    <p className="text-sm text-slate-500 font-medium">Verification for {selectedUser.userName}</p>
                 </div>
                 <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <CheckCircle size={28} className="fill-slate-100 stroke-slate-400" />
                 </button>
              </div>
              
              <div className="p-8 pt-4 space-y-6">
                 <div className="bg-primary-50 dark:bg-primary-900/10 p-5 rounded-2xl border border-primary-100 dark:border-primary-800/30">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">{selectedUser.workDetails?.metric || 'Performance'}</span>
                       <span className="text-2xl font-black text-primary-700 dark:text-primary-300">{selectedUser.workDetails?.value || 'N/A'}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                       "{selectedUser.workDetails?.description || 'Work validated by department supervisor.'}"
                    </p>
                 </div>

                 <div className="space-y-3">
                    <DetailRow label="Monthly Base" value={selectedUser.baseSalary} />
                    <DetailRow label="Fixed Allowance" value={selectedUser.allowance} />
                    <DetailRow label="Performance Bonus" value={selectedUser.bonuses} highlighted={true} />
                    <DetailRow label="Taxation/PF" value={selectedUser.deductions} isNegative={true} />
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                       <span className="text-base font-black text-slate-900 dark:text-slate-100 uppercase italic">Calculated Net</span>
                       <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tighter">{selectedUser.netSalary}</span>
                    </div>
                 </div>

                 <Button 
                   className="w-full h-14 bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 font-black uppercase text-base rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
                   onClick={() => setIsDetailModalOpen(false)}
                 >
                   Confirm Record
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon }) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
           <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{title}</p>
           <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none tracking-tighter">{value}</h4>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
           {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const DetailRow = ({ label, value, highlighted, isNegative }) => (
  <div className="flex justify-between items-center py-1">
     <span className="text-sm text-slate-500 font-medium">{label}</span>
     <span className={`text-sm font-bold ${highlighted ? 'text-primary-600 dark:text-primary-400' : isNegative ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
        {isNegative ? '-' : highlighted ? '+' : ''}{value}
     </span>
  </div>
);

export default SalaryManagement;
