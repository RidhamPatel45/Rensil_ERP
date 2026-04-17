import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { taskService } from '../../../services/taskService';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Play, Clock, CheckCircle, Calendar, Tag, FileText } from 'lucide-react';
import RequestApprovalModal from '../../../components/ui/RequestApprovalModal';

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const stats = {
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
    total: tasks.length
  };

  useEffect(() => {
    const fetchTasks = async () => {
      // Fetch mock tasks for this worker
      let data = await taskService.getTasksByAssignee('Bill Worker'); 
      // Map legacy "To Do" to "Pending"
      data = data.map(t => t.status === 'To Do' ? { ...t, status: 'Pending' } : t);
      setTasks(data);
      setIsLoading(false);
    };
    fetchTasks();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return 'success';
      case 'In Progress': return 'primary';
      default: return 'default';
    }
  };

  const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };

  const filteredTasks = tasks.filter(t => 
    activeTab === 'All' || t.status === activeTab
  ).sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Assigned Tasks</h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="flex items-center space-x-2 border-primary-200 dark:border-primary-900/40 hover:bg-primary-50 dark:hover:bg-primary-900/20"
        >
          <PlusCircle size={18} />
          <span>Request Approval</span>
        </Button>
      </div>

      <RequestApprovalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><Clock size={20} /></div>
          <div><p className="text-xs text-slate-500 font-medium uppercase">Pending</p><p className="text-xl font-bold dark:text-white">{stats.pending}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Play size={20} /></div>
          <div><p className="text-xs text-slate-500 font-medium uppercase">In Progress</p><p className="text-xl font-bold dark:text-white">{stats.inProgress}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
          <div><p className="text-xs text-slate-500 font-medium uppercase">Completed</p><p className="text-xl font-bold dark:text-white">{stats.done}</p></div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-max">
        {['All', 'Pending', 'In Progress', 'Done'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading your tasks...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.length === 0 && (
            <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-16 text-center animate-in fade-in zoom-in duration-300">
               <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <CheckCircle size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                 {activeTab === 'All' ? "All Tasks Completed!" : `No ${activeTab} Tasks`}
               </h3>
               <p className="text-sm text-slate-500 max-w-xs mx-auto">
                 {activeTab === 'All' ? "You've finished everything on your plate. Take a well-deserved break or check in for new assignments!" : `You don't have any tasks currently marked as ${activeTab.toLowerCase()}.`}
               </p>
            </div>
          )}
          
          {filteredTasks.map((task) => (
            <Card key={task.id} className={`group hover:shadow-lg transition-all border-l-4 overflow-hidden ${
              task.status === 'Done' ? 'border-green-500 bg-green-50/10' :
              task.status === 'In Progress' ? 'border-blue-500 bg-blue-50/10' :
              task.status === 'Pending' ? 'border-amber-500' : 'border-slate-200'
            }`}>
              <CardContent className="p-0">
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          task.status === 'Done' ? 'success' : 
                          task.status === 'In Progress' ? 'primary' : 
                          'warning'
                        } className="flex items-center space-x-1 py-1 pr-2">
                          {task.status === 'Done' && <CheckCircle size={14} className="mr-1" />}
                          {task.status === 'In Progress' && <Play size={14} className="mr-1" />}
                          {task.status === 'Pending' && <Clock size={14} className="mr-1" />}
                          <span>{task.status}</span>
                        </Badge>
                        {task.priority === 'High' && <Badge variant="danger" className="animate-pulse">High Priority</Badge>}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{task.id}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary-600 transition-colors uppercase tracking-tight line-clamp-1">{task.title}</h3>
                    
                    {task.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 italic">
                        "{task.description}"
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4">
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Calendar size={14} className="mr-1.5 text-slate-400" />
                        <span>Due {task.dueDate || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Tag size={14} className="mr-1.5 text-slate-400" />
                        <span>{task.category || 'Standard'}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <FileText size={14} className="mr-1.5 text-slate-400" />
                        <span className="uppercase tracking-tight">Work Order</span>
                      </div>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      className={`w-full font-bold shadow-sm transition-all ${
                        task.status === 'Done' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300' : 'bg-primary-600 hover:bg-primary-700 hover:scale-[1.01]'
                      }`} 
                      onClick={() => navigate(`/worker/tasks/${task.id}`)}
                    >
                      {task.status === 'Done' ? 'View Completion' : 'Manage Task'}
                    </Button>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;
