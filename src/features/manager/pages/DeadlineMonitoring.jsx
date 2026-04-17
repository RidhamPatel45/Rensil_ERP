import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { AlertCircle, BellRing } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { taskService } from '../../../services/taskService';
import { addNotification } from '../../../store/notificationSlice';

const DeadlineMonitoring = () => {
  const [tasks, setTasks] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await taskService.getTasks();
      // Filter out 'Done' tasks for deadlines
      setTasks(data.filter(t => t.status !== 'Done'));
    };
    fetchTasks();
  }, []);

  const handleNotify = (task) => {
    toast.success(`Reminder sent to ${task.assignedTo}`);
    dispatch(addNotification({
      title: 'Reminder Sent',
      message: `System sent an automated reminder to ${task.assignedTo} regarding ${task.id}.`,
      targetRole: 'Manager'
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Deadline Monitoring</h2>

      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex items-start space-x-3">
        <AlertCircle className="text-red-500 mt-0.5" size={20} />
        <div>
          <h4 className="text-red-800 dark:text-red-400 font-medium">Critical Deadlines Approaching</h4>
          <p className="text-red-600 dark:text-red-500/80 text-sm mt-1">2 tasks are due within the next 48 hours. Please review assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
           <Card key={task.id} className="border-l-4 border-l-red-500 flex flex-col justify-between h-full">
             <CardContent className="p-5">
               <div className="flex justify-between items-start mb-2">
                 <Badge variant="danger">Due: {task.dueDate}</Badge>
                 <span className="text-xs text-slate-400 dark:text-slate-500">{task.id}</span>
               </div>
               <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{task.title}</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400">Assigned: {task.assignedTo}</p>
             </CardContent>
             <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
               <Button onClick={() => handleNotify(task)} variant="outline" size="sm" className="w-full text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                 <BellRing size={14} className="mr-2" /> Notify Worker
               </Button>
             </div>
           </Card>
        ))}
        
        {tasks.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
            No active deadlines to monitor!
          </div>
        )}
      </div>
    </div>
  );
};

export default DeadlineMonitoring;
