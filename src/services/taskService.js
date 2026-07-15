import { apiFetch } from './apiHelper';

export const taskService = {
  getTasks: async () => {
    return apiFetch('/api/tasks');
  },
  
  getTasksByAssignee: async (assigneeName) => {
    return apiFetch(`/api/tasks/assignee/${encodeURIComponent(assigneeName)}`);
  },
  
  getTaskById: async (id) => {
    return apiFetch(`/api/tasks/${id}`);
  },

  updateTaskStatus: async (id, newStatus) => {
    return apiFetch(`/api/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
  }
};
