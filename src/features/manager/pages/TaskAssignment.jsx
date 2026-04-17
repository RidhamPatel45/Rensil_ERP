import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input, Label } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Plus, UserPlus, Search } from 'lucide-react';
import { taskService } from '../../../services/taskService';
import { addNotification } from '../../../store/notificationSlice';

const WORKER_LIST = ['Bill Worker', 'Jane Expert', 'Sam Junior'];

const TaskAssignment = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Priority');
  const dispatch = useDispatch();

  // Create Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('High');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Assign Form State
  const [selectedWorker, setSelectedWorker] = useState(WORKER_LIST[0]);

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await taskService.getTasks();
      // Map 'To Do' to 'Pending' so the mock data matches the request
      const formattedData = data.map(t => 
        t.status === 'To Do' ? { ...t, status: 'Pending' } : t
      );
      setTasks(formattedData);
      setIsLoading(false);
    };
    fetchTasks();
  }, []);

  const handleCreateTask = () => {
    if (!newTaskTitle) {
      toast.error('Task title is required.');
      return;
    }

    const newTask = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      startDate: newTaskStartDate || new Date().toISOString().split('T')[0],
      dueDate: newTaskDueDate || 'N/A',
      status: 'Pending',
      assignedTo: 'Unassigned'
    };

    setTasks([newTask, ...tasks]);
    toast.success(`Task ${newTask.id} created successfully!`);
    dispatch(addNotification({
       title: 'New Task Created',
       message: `Manager created ${newTask.id}: ${newTaskTitle}`,
       targetRole: 'Manager'
    }));

    // Reset and close
    setNewTaskTitle('');
    setNewTaskPriority('High');
    setNewTaskStartDate('');
    setNewTaskDueDate('');
    setIsCreateModalOpen(false);
  };

  const handleConfirmAssign = () => {
    if (!assigningTaskId) return;

    const updatedTasks = tasks.map(task => 
      task.id === assigningTaskId ? { ...task, assignedTo: selectedWorker } : task
    );
    setTasks(updatedTasks);
    
    toast.success(`Task ${assigningTaskId} assigned to ${selectedWorker}`);
    dispatch(addNotification({
      title: 'Task Assigned',
      message: `Task ${assigningTaskId} was dynamically assigned to ${selectedWorker} by Manager.`,
      targetRole: 'Manager'
    }));

    setAssigningTaskId(null);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return 'success';
      case 'In Progress': return 'primary';
      default: return 'default';
    }
  };

  const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };

  const filteredTasks = tasks.filter(t => {
    const matchesTab = activeTab === 'All' || t.status === activeTab;
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    if (sortField === 'Priority') return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (sortField === 'Status') return a.status.localeCompare(b.status);
    if (sortField === 'Assigned To') return a.assignedTo.localeCompare(b.assignedTo);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Task Assignment</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Create Task
        </Button>
      </div>

      <div className="flex justify-between items-center">
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
        
        <div className="flex items-center space-x-2">
          <Label className="text-slate-500 whitespace-nowrap mb-0 mt-1">Sort By:</Label>
          <select 
            value={sortField} 
            onChange={e => setSortField(e.target.value)}
            className="h-9 w-36 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-100 font-medium"
          >
            <option value="Priority">Priority</option>
            <option value="Status">Status</option>
            <option value="Assigned To">Assignee</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Production Queue</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search tasks or workers..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading tasks...</TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                     No tasks in '{activeTab}' status.
                   </TableCell>
                 </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">{task.id}</TableCell>
                    <TableCell className="dark:text-slate-200">{task.title}</TableCell>
                    <TableCell>
                      {task.assignedTo === 'Unassigned' ? (
                        <span className="text-slate-400 italic">Unassigned</span>
                      ) : (
                        <span className="dark:text-slate-300">{task.assignedTo}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-500">Start: {task.startDate || '2023-10-01'}</div>
                      <div className="text-xs text-primary-600 font-medium whitespace-nowrap mt-1">Due: {task.dueDate || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       {task.assignedTo === 'Unassigned' && (
                         <Button onClick={() => setAssigningTaskId(task.id)} variant="outline" size="sm" className="h-8 shadow-none border-primary-200 text-primary-700 hover:bg-primary-50 whitespace-nowrap">
                           <UserPlus size={14} className="mr-1" /> Assign
                         </Button>
                       )}
                       <Button onClick={() => setSelectedTask(task)} variant="ghost" size="sm" className="h-8">Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Task">
        <div className="space-y-4">
          <div>
            <Label>Task Title</Label>
            <Input 
              value={newTaskTitle} 
              onChange={e => setNewTaskTitle(e.target.value)} 
              placeholder="e.g. Dye 500 batches of wool" 
            />
          </div>
          <div>
            <Label>Priority</Label>
            <select 
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                value={newTaskStartDate} 
                onChange={e => setNewTaskStartDate(e.target.value)} 
                type="date" 
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input 
                value={newTaskDueDate} 
                onChange={e => setNewTaskDueDate(e.target.value)} 
                type="date" 
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Save Task</Button>
          </div>
        </div>
      </Modal>

      {/* Assign Task Modal */}
      <Modal isOpen={!!assigningTaskId} onClose={() => setAssigningTaskId(null)} title="Assign Task">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select a worker to assign to Task ID: <strong className="font-mono text-slate-800">{assigningTaskId}</strong></p>
          <div>
            <Label>Available Workers</Label>
            <select 
              value={selectedWorker}
              onChange={e => setSelectedWorker(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
            >
              {WORKER_LIST.map(worker => (
                <option key={worker} value={worker}>{worker}</option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setAssigningTaskId(null)}>Cancel</Button>
            <Button onClick={handleConfirmAssign}>Confirm Assignment</Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details">
        {selectedTask && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Task ID</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-100">{selectedTask.id}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Status</span>
                <Badge variant={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
              </div>
            </div>
            
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Title</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
                {selectedTask.title}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Assigned Worker</span>
                 <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedTask.assignedTo}</p>
               </div>
               <div>
                 <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Due Date</span>
                 <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedTask.dueDate || 'N/A'}</p>
               </div>
               <div>
                 <span className="text-xs text-slate-500 block mb-1">Priority</span>
                 <Badge variant={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
               </div>
            </div>
            
            <div className="pt-4 flex justify-end pb-2">
              <Button onClick={() => setSelectedTask(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskAssignment;
