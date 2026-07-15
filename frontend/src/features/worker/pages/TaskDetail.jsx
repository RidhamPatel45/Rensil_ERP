import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input, Label } from '../../../components/ui/Input';
import { taskService } from '../../../services/taskService';
import { ArrowLeft, Play, Square, FileText } from 'lucide-react';
import { addNotification } from '../../../store/notificationSlice';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [timeSpent, setTimeSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [qualityCheck, setQualityCheck] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      const data = await taskService.getTaskById(id);
      setTask(data);
      setIsLoading(false);
    };
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setTask({ ...task, status: newStatus });
    await taskService.updateTaskStatus(task.id, newStatus);
    toast.success(`Task status changed to ${newStatus}`);
    dispatch(addNotification({
      title: 'Task Status Updated',
      message: `Worker changed ${task.id} to ${newStatus}.`,
      targetRole: 'Worker'
    }));
  };

  const handleSubmitReport = async () => {
    if (!timeSpent) {
      toast.error('Please log the time spent.');
      return;
    }
    await handleStatusChange('Done');
    toast.success('Completion report submitted successfully!');
    navigate('/worker/tasks');
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading task data...</div>;
  if (!task) return <div className="p-12 text-center text-red-500">Task not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/worker/tasks')} className="px-2 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">
          <ArrowLeft size={18} className="mr-1" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{task.title}</h2>
        <Badge variant={task.status === 'Done' ? 'success' : task.status === 'In Progress' ? 'primary' : 'default'}>
          {task.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Main Content Area */}
         <div className="md:col-span-2 space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Completion Report Form</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div>
                   <Label>Time Spent (Hours)</Label>
                   <Input 
                     type="number" 
                     value={timeSpent} 
                     onChange={e => setTimeSpent(e.target.value)} 
                     placeholder="e.g. 4.5" 
                   />
                 </div>
                 <div>
                   <Label>Materials Used Notes</Label>
                    <textarea 
                      rows={4}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="flex w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="List exact batch numbers or quantity if relevant..."
                    ></textarea>
                 </div>
                 <div>
                   <Label>Quality Check Notes</Label>
                   <Input 
                     value={qualityCheck} 
                     onChange={e => setQualityCheck(e.target.value)} 
                     placeholder="Any issues encountered?" 
                   />
                 </div>
                 <div className="pt-4">
                   <Button onClick={handleSubmitReport} className="w-full bg-green-600 hover:bg-green-700">
                     Submit Completion Report
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Sidebar Actions & Info */}
         <div className="space-y-6">
            <Card>
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <CardTitle className="text-base text-center dark:text-slate-100">Status Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <Button 
                  onClick={() => handleStatusChange('In Progress')} 
                  variant="outline" 
                  disabled={task.status === 'In Progress' || task.status === 'Done'}
                  className="w-full justify-start text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-900/40 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 disabled:opacity-50"
                >
                  <Play size={16} className="mr-2" /> Start Working
                </Button>
                <Button 
                  onClick={() => handleStatusChange('Pending')}
                  disabled={task.status === 'Pending' || task.status === 'Done'}
                  variant="outline" 
                  className="w-full justify-start text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <Square size={16} className="mr-2" /> Pause Task
                </Button>
                <Button onClick={() => toast('Help request sent to manager.', { icon: '🆘'})} variant="outline" className="w-full justify-start text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <FileText size={16} className="mr-2" /> Request Help
                </Button>
             </CardContent>
           </Card>

            <Card>
              <CardContent className="p-4 space-y-3 text-sm">
                <div>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Task ID</p>
                   <p className="text-slate-800 dark:text-slate-100 font-mono">{task.id}</p>
                </div>
                <div>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Due Date</p>
                   <p className="text-slate-800 dark:text-slate-100">{task.dueDate}</p>
                </div>
                <div>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Priority</p>
                   <p className="text-slate-800 dark:text-slate-100">{task.priority}</p>
                </div>
              </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default TaskDetail;
