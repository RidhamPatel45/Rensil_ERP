import { orderService } from './orderService';
import { taskService } from './taskService';
import { inventoryService } from './inventoryService';

export const reportService = {
  getFinancialData: async () => {
    const orders = await orderService.getOrders();
    
    // Calculate totals
    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;
    
    orders.forEach(o => {
      const val = parseInt(o.amount.replace(/[^0-9]/g, ''), 10);
      totalRevenue += val;
      if (o.paymentStatus === 'Paid') paidRevenue += val;
      else pendingRevenue += val;
    });

    const gstCollected = Math.floor(paidRevenue * 0.18);
    const estimatedCosts = Math.floor(totalRevenue * 0.65); // Simulating 65% COGS

    // Monthly trends (mocked)
    const trends = [
      { month: 'Jan', revenue: Math.floor(totalRevenue * 0.8), costs: Math.floor(totalRevenue * 0.5) },
      { month: 'Feb', revenue: Math.floor(totalRevenue * 0.9), costs: Math.floor(totalRevenue * 0.6) },
      { month: 'Mar', revenue: totalRevenue, costs: estimatedCosts },
    ];

    return {
      kpis: {
        totalRevenue: `₹${totalRevenue.toLocaleString()}`,
        paidRevenue: `₹${paidRevenue.toLocaleString()}`,
        pendingRevenue: `₹${pendingRevenue.toLocaleString()}`,
        gstCollected: `₹${gstCollected.toLocaleString()}`,
        grossMargin: '35%'
      },
      trends
    };
  },

  getEfficiencyData: async () => {
    const tasks = await taskService.getTasks();
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = total - completed - inProgress;

    // Worker performance simulation
    const workers = ['Bill Worker', 'John Doe', 'Sarah Smith'];
    const performance = workers.map(w => ({
       name: w,
       completed: tasks.filter(t => t.assignedTo === w && t.status === 'Done').length,
       total: tasks.filter(t => t.assignedTo === w).length
    }));

    return {
      summary: { total, completed, inProgress, pending, successRate: `${Math.floor((completed/total)*100)}%` },
      performance
    };
  }
};
