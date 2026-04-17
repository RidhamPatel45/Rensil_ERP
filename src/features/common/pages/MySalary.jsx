import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  Clock, 
  Calendar,
  IndianRupee,
  FileText,
  Briefcase
} from 'lucide-react';
import { salaryService } from '../../../services/salaryService';

const MySalary = () => {
  const { user } = useSelector((state) => state.auth);
  const [salary, setSalary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalary = async () => {
      if (user?.id) {
        const data = await salaryService.getMySalary(user.id);
        setSalary(data);
      }
      setIsLoading(false);
    };
    fetchSalary();
  }, [user]);

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Crunching payroll data...</div>;

  if (!salary) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
       <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-12 mb-6 border-2 border-dashed border-slate-200 dark:border-slate-700">
          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 italic">No Payroll Record Found</h3>
          <p className="text-slate-500 mt-2">Salary details for your profile haven't been published yet. Please contact the administrator.</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Financial Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly earnings and performance-linked incentives</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Next Payout</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Nov 01, 2023</p>
           </div>
           <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 dark:border-slate-700 shadow-sm">
             <Download size={16} className="mr-2" /> Download Payslip
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Salary Card */}
        <Card className="md:col-span-2 bg-primary-600 dark:bg-primary-900/40 text-white overflow-hidden relative border-none shadow-xl">
           <CardContent className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <p className="text-primary-100 text-sm font-bold uppercase tracking-widest mb-1">Net Payout (October)</p>
                   <h3 className="text-5xl font-black">{salary.netSalary}</h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/20 px-3 py-1 font-bold backdrop-blur-md">
                   {salary.paymentStatus === 'Paid' ? (
                     <span className="flex items-center"><CheckCircle2 size={14} className="mr-1" /> Released</span>
                   ) : (
                     <span className="flex items-center"><Clock size={14} className="mr-1" /> Processing</span>
                   )}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/10">
                 <div>
                   <p className="text-primary-200 text-[10px] font-bold uppercase">Base</p>
                   <p className="text-lg font-bold">{salary.baseSalary}</p>
                 </div>
                 <div>
                   <p className="text-primary-200 text-[10px] font-bold uppercase">Bonuses</p>
                   <p className="text-lg font-bold">{salary.bonuses}</p>
                 </div>
                 <div>
                   <p className="text-primary-200 text-[10px] font-bold uppercase">Allowances</p>
                   <p className="text-lg font-bold">{salary.allowance}</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Work Details / Performance */}
        <Card className="border-none shadow-md bg-white dark:bg-slate-900">
           <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-4">
              <CardTitle className="text-base flex items-center">
                 <TrendingUp size={18} className="mr-2 text-primary-500" />
                 Work Details
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              {salary.workDetails ? (
                <div className="space-y-6">
                   <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{salary.workDetails.metric}</p>
                      <h4 className="text-3xl font-black text-primary-600 dark:text-primary-400">{salary.workDetails.value}</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                         <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                            <Briefcase size={16} className="text-primary-600 dark:text-primary-400" />
                         </div>
                         <div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                               {salary.workDetails.description}
                            </p>
                         </div>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                         <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold italic tracking-tight text-center uppercase">
                            Performance Multiplier Applied: 1.2x
                         </p>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-center py-8">
                   <p className="text-xs text-slate-400 italic">No specific performance metrics tracked for this period.</p>
                </div>
              )}
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Payment History */}
         <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center justify-between">
                  <span>Payment History</span>
                  <Calendar size={18} className="text-slate-400" />
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {salary.history.map((h, i) => (
                    <div key={i} className="py-4 flex items-center justify-between group transition-all">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 font-bold text-slate-400 text-xs">
                             {h.month.substring(0, 3)}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{h.month} 2023</p>
                             <p className="text-[10px] text-slate-400 font-medium">Standard Bank Transfer</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-slate-50">{h.amount}</p>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Settled</span>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Salary Breakdown (Optional/New) */}
         <Card className="bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50">
            <CardHeader>
               <CardTitle className="text-lg">Full Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                  <BreakdownRow label="Basic Salary" value={salary.baseSalary} />
                  <BreakdownRow label="Conveyance Allowance" value="₹3,500" />
                  <BreakdownRow label="House Rent Allowance" value="₹5,000" />
                  <BreakdownRow label="Special Bonus" value={salary.bonuses} isPositive={true} />
                  <BreakdownRow label="Provident Fund" value={salary.deductions} isNegative={true} />
                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center px-2">
                     <span className="text-base font-black text-slate-900 dark:text-slate-50 uppercase tracking-tighter">Hand Payout</span>
                     <span className="text-2xl font-black text-primary-600 dark:text-primary-400">{salary.netSalary}</span>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};

const BreakdownRow = ({ label, value, isPositive, isNegative }) => (
  <div className="flex justify-between items-center py-2 px-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
     <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{label}</span>
     <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
        {isNegative ? '-' : isPositive ? '+' : ''}{value}
     </span>
  </div>
);

export default MySalary;
