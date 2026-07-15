import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getDb, initDb } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database initialization
try {
  await initDb();
} catch (error) {
  console.error('Failed to initialize database:', error);
}

// Audit helper
async function createAuditLog(db, req, module, action, description) {
  const userName = req.headers['x-user-name'] || 'System';
  const userRole = req.headers['x-user-role'] || 'System';
  const id = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();
  
  await db.run(
    'INSERT INTO audit_logs (id, timestamp, user, userRole, module, action, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, timestamp, userName, userRole, module, action, description]
  );
  console.log(`[AUDIT] ${action} by ${userName}`);
}

// --- API ROUTES ---

// 1. Auth & Users
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = await getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      await createAuditLog(db, req, 'Security', 'Failed Login', `Unauthorized attempt using email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      await createAuditLog(db, req, 'Security', 'Failed Login', `Unauthorized attempt using email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    // Set headers manually for audit log creation
    req.headers['x-user-name'] = user.name;
    req.headers['x-user-role'] = user.role;
    await createAuditLog(db, req, 'Security', 'User Login', `User logged in as ${user.role}`);
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/users', async (req, res) => {
  const db = await getDb();
  try {
    const users = await db.all('SELECT id, name, email, role, status, avatar FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/users/:id', async (req, res) => {
  const db = await getDb();
  try {
    const user = await db.get('SELECT id, name, email, role, status, avatar FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email, role, password } = req.body;
  const db = await getDb();
  try {
    const userExists = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const plainPassword = password || 'password123';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    const id = `USR-${Date.now().toString().slice(-4)}`;
    const status = 'Active';
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    await db.run(
      'INSERT INTO users (id, name, email, role, status, password, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, role, status, hashedPassword, avatar]
    );

    const newUser = { id, name, email, role, status, avatar };
    await createAuditLog(db, req, 'Admin', 'User Created', `Added new user ${name} as ${role}`);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.put('/api/users/:id', async (req, res) => {
  const updates = req.body;
  const db = await getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Exclude password and id from simple updates
    const keys = Object.keys(updates).filter(k => k !== 'password' && k !== 'id');
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);

    if (setClause) {
      await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
    }

    const updatedUser = await db.get('SELECT id, name, email, role, status, avatar FROM users WHERE id = ?', [req.params.id]);
    await createAuditLog(db, req, 'Admin', 'User Updated', `Updated profile/settings for ${updatedUser.name}`);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 2. Audit Logs
app.get('/api/audit-logs', async (req, res) => {
  const db = await getDb();
  try {
    const logs = await db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/audit-logs', async (req, res) => {
  const { module, action, description } = req.body;
  const db = await getDb();
  try {
    await createAuditLog(db, req, module, action, description);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 3. Inventory
app.get('/api/inventory', async (req, res) => {
  const db = await getDb();
  try {
    const inventory = await db.all('SELECT * FROM inventory ORDER BY id DESC');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/inventory/low-stock', async (req, res) => {
  const db = await getDb();
  try {
    const lowStock = await db.all("SELECT * FROM inventory WHERE status = 'Low Stock' OR status = 'Critical'");
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/inventory/usage-logs', async (req, res) => {
  const db = await getDb();
  try {
    const logs = await db.all('SELECT * FROM usage_logs ORDER BY date DESC, id DESC');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const updates = req.body;
  const db = await getDb();
  try {
    const item = await db.get('SELECT * FROM inventory WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });

    const keys = Object.keys(updates).filter(k => k !== 'id');
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);

    if (setClause) {
      await db.run(`UPDATE inventory SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
    }

    await createAuditLog(db, req, 'Inventory', 'Stock Update', `Item ${req.params.id} updated with ${JSON.stringify(updates)}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/inventory', async (req, res) => {
  const newItem = req.body;
  const db = await getDb();
  try {
    await db.run(
      'INSERT INTO inventory (id, name, category, quantity, unit, status, lastRestock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newItem.id, newItem.name, newItem.category, newItem.quantity, newItem.unit, newItem.status, newItem.lastRestock]
    );

    await createAuditLog(db, req, 'Inventory', 'New Material', `${newItem.name} added to catalog.`);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/inventory/usage-logs', async (req, res) => {
  const newLog = req.body;
  const db = await getDb();
  try {
    await db.run(
      'INSERT INTO usage_logs (id, materialId, materialName, quantityUsed, unit, taskRef, usedBy, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.materialId, newLog.materialName, newLog.quantityUsed, newLog.unit, newLog.taskRef, newLog.usedBy, newLog.date]
    );
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 4. Orders
app.get('/api/orders', async (req, res) => {
  const db = await getDb();
  try {
    const orders = await db.all('SELECT * FROM orders ORDER BY datePlaced DESC, id DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const db = await getDb();
  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.put('/api/orders/:id/payment', async (req, res) => {
  const { status } = req.body;
  const db = await getDb();
  try {
    await db.run('UPDATE orders SET paymentStatus = ? WHERE id = ?', [status, req.params.id]);
    await createAuditLog(db, req, 'Sales', 'Payment Update', `Order ${req.params.id} marked as ${status}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/orders', async (req, res) => {
  const order = req.body;
  const db = await getDb();
  try {
    await db.run(
      'INSERT INTO orders (id, customerName, email, product, datePlaced, amount, status, timelineStep, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [order.id, order.customerName, order.email, order.product, order.datePlaced, order.amount, order.status, order.timelineStep, order.paymentStatus]
    );

    await createAuditLog(db, req, 'Sales', 'Order Created', `New order ${order.id} for ${order.amount} recorded.`);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 5. Products
app.get('/api/products', async (req, res) => {
  const db = await getDb();
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 6. Salaries
app.get('/api/salaries', async (req, res) => {
  const db = await getDb();
  try {
    const salaries = await db.all('SELECT * FROM salaries');
    const users = await db.all('SELECT id, name, email, role FROM users');

    const enriched = salaries.map(salary => {
      const user = users.find(u => u.id.toString() === salary.userId.toString());
      return {
        ...salary,
        userName: user ? user.name : (salary.role || 'Unknown User'),
        userEmail: user ? user.email : 'N/A',
        role: user ? user.role : (salary.role || 'Staff'),
        workDetails: salary.workDetails ? JSON.parse(salary.workDetails) : null,
        history: salary.history ? JSON.parse(salary.history) : []
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/salaries/my/:userId', async (req, res) => {
  const db = await getDb();
  try {
    const salary = await db.get('SELECT * FROM salaries WHERE userId = ?', [req.params.userId]);
    if (!salary) return res.json(null);
    
    res.json({
      ...salary,
      workDetails: salary.workDetails ? JSON.parse(salary.workDetails) : null,
      history: salary.history ? JSON.parse(salary.history) : []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.put('/api/salaries/payout/:userId', async (req, res) => {
  const { status } = req.body;
  const db = await getDb();
  try {
    await db.run("UPDATE salaries SET paymentStatus = ?, lastPaymentDate = ? WHERE userId = ?", [status, new Date().toISOString().split('T')[0], req.params.userId]);
    console.log(`Updated payout for user ${req.params.userId} to ${status}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 7. Suppliers
app.get('/api/suppliers/purchase-orders', async (req, res) => {
  const db = await getDb();
  try {
    const orders = await db.all('SELECT * FROM supply_orders ORDER BY dateRequested DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/suppliers/shipments', async (req, res) => {
  const db = await getDb();
  try {
    const shipments = await db.all("SELECT * FROM supply_orders WHERE status = 'Shipped'");
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 8. Tasks
app.get('/api/tasks', async (req, res) => {
  const db = await getDb();
  try {
    const tasks = await db.all('SELECT * FROM tasks ORDER BY dueDate ASC');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/tasks/assignee/:assigneeName', async (req, res) => {
  const db = await getDb();
  try {
    const tasks = await db.all('SELECT * FROM tasks WHERE assignedTo = ? ORDER BY dueDate ASC', [req.params.assigneeName]);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  const db = await getDb();
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.put('/api/tasks/:id/status', async (req, res) => {
  const { status } = req.body;
  const db = await getDb();
  try {
    await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    await createAuditLog(db, req, 'Manager', 'Task Progress', `Task ${req.params.id} status moved to ${status}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 9. Approvals
app.get('/api/approvals', async (req, res) => {
  const db = await getDb();
  try {
    const approvals = await db.all('SELECT * FROM approvals ORDER BY date DESC, id DESC');
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/approvals', async (req, res) => {
  const { subject, requestedBy, description } = req.body;
  const db = await getDb();
  try {
    const countRow = await db.get('SELECT count(*) as count FROM approvals');
    const id = `REQ-${String(countRow.count + 1).padStart(2, '0')}`;
    const date = new Date().toISOString().split('T')[0];
    const status = 'Pending';

    await db.run(
      'INSERT INTO approvals (id, subject, requestedBy, date, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [id, subject, requestedBy, date, status, description]
    );

    const newApproval = { id, subject, requestedBy, date, status, description };
    res.status(201).json(newApproval);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.put('/api/approvals/:id', async (req, res) => {
  const { status } = req.body;
  const db = await getDb();
  try {
    await db.run('UPDATE approvals SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 10. Reports
app.get('/api/reports/financials', async (req, res) => {
  const db = await getDb();
  try {
    const orders = await db.all('SELECT amount, paymentStatus FROM orders');
    
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

    // Monthly trends (mocked based on values)
    const trends = [
      { month: 'Jan', revenue: Math.floor(totalRevenue * 0.8), costs: Math.floor(totalRevenue * 0.5) },
      { month: 'Feb', revenue: Math.floor(totalRevenue * 0.9), costs: Math.floor(totalRevenue * 0.6) },
      { month: 'Mar', revenue: totalRevenue, costs: estimatedCosts },
    ];

    res.json({
      kpis: {
        totalRevenue: `₹${totalRevenue.toLocaleString()}`,
        paidRevenue: `₹${paidRevenue.toLocaleString()}`,
        pendingRevenue: `₹${pendingRevenue.toLocaleString()}`,
        gstCollected: `₹${gstCollected.toLocaleString()}`,
        grossMargin: '35%'
      },
      trends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/reports/efficiency', async (req, res) => {
  const db = await getDb();
  try {
    const tasks = await db.all('SELECT status, assignedTo FROM tasks');
    
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

    res.json({
      summary: { total, completed, inProgress, pending, successRate: `${total > 0 ? Math.floor((completed/total)*100) : 0}%` },
      performance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});


// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
