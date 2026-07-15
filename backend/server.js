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

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ---------------------------------------------------------------------------
// Database Initialization
// ---------------------------------------------------------------------------
try {
  await initDb();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Audit Helper
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------

// 1. Auth & Users ---------------------------------------------------------
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const db = await getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      await createAuditLog(db, req, 'Security', 'Failed Login', `Unauthorized attempt using email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const { password: _, ...userWithoutPassword } = user;
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
    const exists = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (exists) return res.status(400).json({ message: 'User with this email already exists' });

    const hashed = bcrypt.hashSync(password || 'password123', 10);
    const id = `USR-${Date.now().toString().slice(-4)}`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    await db.run(
      'INSERT INTO users (id, name, email, role, status, password, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, role, 'Active', hashed, avatar]
    );
    await createAuditLog(db, req, 'Admin', 'User Created', `Added new user ${name} as ${role}`);
    res.status(201).json({ id, name, email, role, status: 'Active', avatar });
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
    const keys = Object.keys(updates).filter(k => k !== 'password' && k !== 'id');
    if (keys.length) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, [...keys.map(k => updates[k]), req.params.id]);
    }
    const updated = await db.get('SELECT id, name, email, role, status, avatar FROM users WHERE id = ?', [req.params.id]);
    await createAuditLog(db, req, 'Admin', 'User Updated', `Updated profile for ${updated.name}`);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 2. Audit Logs -----------------------------------------------------------
app.get('/api/audit-logs', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC'));
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

// 3. Inventory ------------------------------------------------------------
app.get('/api/inventory', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM inventory ORDER BY id'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/inventory/low-stock', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all("SELECT * FROM inventory WHERE status = 'Low Stock' OR status = 'Critical'"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/inventory/usage-logs', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM usage_logs ORDER BY date DESC'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/inventory', async (req, res) => {
  const item = req.body;
  const db = await getDb();
  try {
    await db.run(
      'INSERT INTO inventory (id, name, category, quantity, unit, status, lastRestock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.category, item.quantity, item.unit, item.status, item.lastRestock]
    );
    await createAuditLog(db, req, 'Inventory', 'New Material', `${item.name} added to catalog.`);
    res.status(201).json(item);
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
    const keys = Object.keys(updates).filter(k => k !== 'id');
    if (keys.length) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await db.run(`UPDATE inventory SET ${setClause} WHERE id = ?`, [...keys.map(k => updates[k]), req.params.id]);
    }
    await createAuditLog(db, req, 'Inventory', 'Stock Update', `Item ${req.params.id} updated.`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.post('/api/inventory/usage-logs', async (req, res) => {
  const log = req.body;
  const db = await getDb();
  try {
    await db.run(
      'INSERT INTO usage_logs (id, materialId, materialName, quantityUsed, unit, taskRef, usedBy, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [log.id, log.materialId, log.materialName, log.quantityUsed, log.unit, log.taskRef, log.usedBy, log.date]
    );
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 4. Orders ---------------------------------------------------------------
app.get('/api/orders', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM orders ORDER BY datePlaced DESC'));
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

app.post('/api/orders', async (req, res) => {
  const o = req.body;
  const db = await getDb();
  try {
    await db.run(
      'INSERT INTO orders (id, customerName, email, product, datePlaced, amount, status, timelineStep, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [o.id, o.customerName, o.email, o.product, o.datePlaced, o.amount, o.status, o.timelineStep, o.paymentStatus]
    );
    await createAuditLog(db, req, 'Sales', 'Order Created', `New order ${o.id} for ${o.amount} recorded.`);
    res.status(201).json({ success: true });
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

// 5. Products -------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM products'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 6. Salaries -------------------------------------------------------------
app.get('/api/salaries', async (req, res) => {
  const db = await getDb();
  try {
    const salaries = await db.all('SELECT * FROM salaries');
    const users = await db.all('SELECT id, name, email, role FROM users');
    const enriched = salaries.map(s => {
      const u = users.find(u => u.id.toString() === s.userId.toString());
      return {
        ...s,
        userName:  u ? u.name  : (s.role || 'Unknown'),
        userEmail: u ? u.email : 'N/A',
        role:      u ? u.role  : (s.role || 'Staff'),
        workDetails: s.workDetails ? JSON.parse(s.workDetails) : null,
        history:     s.history     ? JSON.parse(s.history)     : []
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
    const s = await db.get('SELECT * FROM salaries WHERE userId = ?', [req.params.userId]);
    if (!s) return res.json(null);
    res.json({
      ...s,
      workDetails: s.workDetails ? JSON.parse(s.workDetails) : null,
      history:     s.history     ? JSON.parse(s.history)     : []
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
    const today = new Date().toISOString().split('T')[0];
    await db.run('UPDATE salaries SET paymentStatus = ?, lastPaymentDate = ? WHERE userId = ?', [status, today, req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 7. Suppliers ------------------------------------------------------------
app.get('/api/suppliers/purchase-orders', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM supply_orders ORDER BY dateRequested DESC'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/suppliers/shipments', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all("SELECT * FROM supply_orders WHERE status = 'Shipped'"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// 8. Tasks ----------------------------------------------------------------
app.get('/api/tasks', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM tasks ORDER BY dueDate ASC'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/tasks/assignee/:name', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM tasks WHERE assignedTo = ? ORDER BY dueDate ASC', [req.params.name]));
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

// 9. Approvals ------------------------------------------------------------
app.get('/api/approvals', async (req, res) => {
  const db = await getDb();
  try {
    res.json(await db.all('SELECT * FROM approvals ORDER BY date DESC'));
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
    const { count } = await db.get('SELECT count(*) as count FROM approvals');
    const id = `REQ-${String(count + 1).padStart(2, '0')}`;
    const date = new Date().toISOString().split('T')[0];
    await db.run(
      'INSERT INTO approvals (id, subject, requestedBy, date, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [id, subject, requestedBy, date, 'Pending', description]
    );
    res.status(201).json({ id, subject, requestedBy, date, status: 'Pending', description });
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

// 10. Reports -------------------------------------------------------------
app.get('/api/reports/financials', async (req, res) => {
  const db = await getDb();
  try {
    const orders = await db.all('SELECT amount, paymentStatus FROM orders');
    let total = 0, paid = 0, pending = 0;
    orders.forEach(o => {
      const v = parseInt(o.amount.replace(/[^0-9]/g, ''), 10);
      total += v;
      if (o.paymentStatus === 'Paid') paid += v; else pending += v;
    });
    const gst = Math.floor(paid * 0.18);
    const costs = Math.floor(total * 0.65);
    res.json({
      kpis: {
        totalRevenue: `₹${total.toLocaleString()}`,
        paidRevenue:  `₹${paid.toLocaleString()}`,
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
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

app.get('/api/reports/efficiency', async (req, res) => {
  const db = await getDb();
  try {
    const tasks = await db.all('SELECT status, assignedTo FROM tasks');
    const total     = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending   = total - completed - inProgress;
    const workers   = ['Bill Worker', 'John Doe', 'Sarah Smith'];
    res.json({
      summary: { total, completed, inProgress, pending, successRate: `${total > 0 ? Math.floor((completed / total) * 100) : 0}%` },
      performance: workers.map(w => ({
        name: w,
        completed: tasks.filter(t => t.assignedTo === w && t.status === 'Done').length,
        total:     tasks.filter(t => t.assignedTo === w).length
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await db.close();
  }
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 Rug Factory Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database    : ${process.env.DATABASE_FILE || 'database.sqlite'}\n`);
});
