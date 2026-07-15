import Order from '../models/Order.js';
import Task from '../models/Task.js';

export async function getFinancials(req, res, next) {
  try {
    const orders = await Order.find({}, 'amount paymentStatus');
    
    let total = 0, paid = 0, pending = 0;
    orders.forEach(o => {
      const v = parseInt(o.amount.replace(/[^0-9]/g, ''), 10) || 0;
      total += v;
      if (o.paymentStatus === 'Paid') {
        paid += v;
      } else {
        pending += v;
      }
    });

    const gst = Math.floor(paid * 0.18);
    const costs = Math.floor(total * 0.65);
    
    res.json({
      kpis: {
        totalRevenue: `₹${total.toLocaleString()}`,
        paidRevenue: `₹${paid.toLocaleString()}`,
        pendingRevenue: `₹${pending.toLocaleString()}`,
        gstCollected: `₹${gst.toLocaleString()}`,
        grossMargin: '35%'
      },
      trends: [
        { month: 'Jan', revenue: Math.floor(total * 0.8), costs: Math.floor(total * 0.5) },
        { month: 'Feb', revenue: Math.floor(total * 0.9), costs: Math.floor(total * 0.6) },
        { month: 'Mar', revenue: total, costs }
      ]
    });
  } catch (error) {
    next(error);
  }
}

export async function getEfficiency(req, res, next) {
  try {
    const tasks = await Task.find({}, 'status assignedTo');
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = total - completed - inProgress;
    
    const workers = ['Bill Worker', 'John Doe', 'Sarah Smith'];
    
    res.json({
      summary: { 
        total, 
        completed, 
        inProgress, 
        pending, 
        successRate: `${total > 0 ? Math.floor((completed / total) * 100) : 0}%` 
      },
      performance: workers.map(w => ({
        name: w,
        completed: tasks.filter(t => t.assignedTo === w && t.status === 'Done').length,
        total: tasks.filter(t => t.assignedTo === w).length
      }))
    });
  } catch (error) {
    next(error);
  }
}
