import tasksData from '../mockData/tasks.json';
import { auditService } from './auditService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hold mock data in memory to persist state across page navigation
let memTasks = [...tasksData].map(t => 
  t.status === 'To Do' ? { ...t, status: 'Pending' } : t
);

export const taskService = {
  getTasks: async () => {
    await delay(600);
    return [...memTasks];
  },
  
  getTasksByAssignee: async (assigneeName) => {
    await delay(400);
    return memTasks.filter(t => t.assignedTo === assigneeName);
  },
  
  getTaskById: async (id) => {
    await delay(300);
    return memTasks.find(t => t.id === id);
  },

  updateTaskStatus: async (id, newStatus) => {
    await delay(200);
    memTasks = memTasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    auditService.logAction('Manager', 'Task Progress', `Task ${id} status moved to ${newStatus}`);
  }
};
