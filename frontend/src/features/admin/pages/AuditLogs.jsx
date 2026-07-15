import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Search, Filter, History, User, Activity, ShieldAlert, X, Clock, Layers, ShieldCheck, FileText } from 'lucide-react';
import { auditService } from '../../../services/auditService';
import clsx from 'clsx';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await auditService.getLogs();
      setLogs(data);
      setIsLoading(false);
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
     const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesModule = filterModule === 'All' || log.module === filterModule;
     return matchesSearch && matchesModule;
  });

  const getModuleBadge = (module) => {
    switch (module) {
      case 'Security': return <Badge variant="danger" className="dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">{module}</Badge>;
      case 'Admin': return <Badge variant="primary" className="dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50">{module}</Badge>;
      case 'Sales': return <Badge variant="success" className="dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50">{module}</Badge>;
      case 'Inventory': return <Badge variant="warning" className="dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50">{module}</Badge>;
      case 'Manager': return <Badge variant="default" className="dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/50">{module}</Badge>;
      default: return <Badge variant="default">{module}</Badge>;
    }
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'Security': return <ShieldAlert size={14} className="text-red-500" />;
      case 'Admin': return <User size={14} className="text-blue-500" />;
      case 'Sales': return <Activity size={14} className="text-green-500" />;
      default: return <History size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">System Audit Logs</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time track of all administrative and operational actions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
             <Input 
                placeholder="Search audit trail..." 
                className="pl-9 bg-white dark:bg-slate-900"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-2 w-full sm:w-auto">
             <select 
               className="flex-1 sm:w-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
               value={filterModule}
               onChange={e => setFilterModule(e.target.value)}
             >
               <option value="All">All Modules</option>
               <option value="Security">Security</option>
               <option value="Admin">Admin</option>
               <option value="Sales">Sales</option>
               <option value="Inventory">Inventory</option>
               <option value="Manager">Manager</option>
             </select>
             {(searchTerm || filterModule !== 'All') && (
               <button 
                onClick={() => { setSearchTerm(''); setFilterModule('All'); }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear Filters"
               >
                 <X size={20} />
               </button>
             )}
           </div>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 flex flex-row items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
             <History size={18} className="text-primary-600 focus:outline-none" />
             <CardTitle className="text-lg font-bold">Event History</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] dark:border-slate-700 dark:text-slate-400">{filteredLogs.length} Events</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center text-slate-400">Loading audit database...</div>
          ) : (
            <>
              {/* Desktop View Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-y border-slate-200 dark:border-slate-800 transition-colors">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[180px] py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2.5">
                          <Clock size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>Timestamp</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[200px] py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2.5">
                          <User size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>User Account</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[140px] py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2.5">
                          <Layers size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>Module</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[160px] py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2.5">
                          <ShieldCheck size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>Action</span>
                        </div>
                      </TableHead>
                      <TableHead className="py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2.5">
                          <FileText size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>Event Description</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <TableCell className="text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap py-5">
                          {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="py-5">
                           <div className="flex items-center space-x-3">
                             <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 shadow-sm">
                               {log.user.charAt(0)}
                             </div>
                             <div>
                               <div className="font-bold text-slate-900 dark:text-slate-100 text-[13px]">{log.user}</div>
                               <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">{log.userRole}</div>
                             </div>
                           </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="scale-90 origin-left">
                            {getModuleBadge(log.module)}
                          </div>
                        </TableCell>
                        <TableCell className="font-extrabold text-slate-800 dark:text-slate-200 text-[12px] py-5">
                          {log.action}
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors py-5 pr-6">
                          {log.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center space-x-2">
                          {getModuleIcon(log.module)}
                          {getModuleBadge(log.module)}
                       </div>
                       <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                         {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{log.action}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{log.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center text-[10px] font-bold border border-primary-200 dark:border-primary-800">
                            {log.user.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{log.user}</span>
                       </div>
                       <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{log.userRole}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLogs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
                   <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <Filter size={32} />
                   </div>
                   <div>
                     <p className="text-slate-800 font-bold">No logs found</p>
                     <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
                     <button onClick={() => { setSearchTerm(''); setFilterModule('All'); }} className="mt-4 text-primary-600 font-bold text-sm hover:underline">
                        Clear all filters
                     </button>
                   </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
