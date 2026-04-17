// In-memory audit log store
let auditLogs = [
  {
    id: 'LOG-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: 'Sam Inventory',
    userRole: 'Inventory Manager',
    module: 'Inventory',
    action: 'Stock Replenished',
    description: 'Added 50 units of Premium Wool (Batch #882).'
  },
  {
    id: 'LOG-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: 'Sarah Sales',
    userRole: 'Sales Manager',
    module: 'Sales',
    action: 'Payment Recorded',
    description: 'Marked Order ORD-772 as PAID (Amount: ₹12,400).'
  },
  {
    id: 'LOG-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: 'Jane Manager',
    userRole: 'Manager',
    module: 'Manager',
    action: 'Task Assigned',
    description: 'Assigned "Quality Inspection" for Order #902 to Bill Worker.'
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    user: 'System Admin',
    userRole: 'Admin',
    module: 'Admin',
    action: 'User Updated',
    description: 'Updated permissions for Worker: Bill Worker.'
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    user: 'Bill Worker',
    userRole: 'Worker',
    module: 'Security',
    action: 'User Login',
    description: 'Successful login from IP: 192.168.1.42.'
  },
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    user: 'System',
    userRole: 'System',
    module: 'Core',
    action: 'System Boot',
    description: 'Rug Factory System v2.0 initialized successfully.'
  }
];

export const auditService = {
  getLogs: async () => {
    return [...auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  logAction: (module, action, description) => {
    // Attempt to get user from localStorage
    const savedUser = localStorage.getItem('rug_factory_user');
    const user = savedUser ? JSON.parse(savedUser) : { name: 'Anonymous' };

    const newEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: user.name,
      userRole: user.role || 'N/A',
      module,
      action,
      description
    };

    auditLogs = [newEntry, ...auditLogs];
    console.log(`[AUDIT] ${action} by ${user.name}`);
  }
};
