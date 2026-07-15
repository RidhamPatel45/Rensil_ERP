import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const mockDataPath = path.join(__dirname, '../src/mockData');

export async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await getDb();

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT,
      dimensions TEXT,
      stock TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      product TEXT NOT NULL,
      datePlaced TEXT NOT NULL,
      amount TEXT NOT NULL,
      status TEXT NOT NULL,
      timelineStep INTEGER NOT NULL,
      paymentStatus TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      status TEXT NOT NULL,
      lastRestock TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id TEXT PRIMARY KEY,
      materialId TEXT NOT NULL,
      materialName TEXT NOT NULL,
      quantityUsed INTEGER NOT NULL,
      unit TEXT NOT NULL,
      taskRef TEXT NOT NULL,
      usedBy TEXT NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS supply_orders (
      id TEXT PRIMARY KEY,
      factoryRef TEXT NOT NULL,
      material TEXT NOT NULL,
      quantity TEXT NOT NULL,
      dateRequested TEXT NOT NULL,
      status TEXT NOT NULL,
      amount TEXT NOT NULL,
      eta TEXT,
      shippingCarrier TEXT
    );

    CREATE TABLE IF NOT EXISTS salaries (
      userId INTEGER PRIMARY KEY,
      baseSalary TEXT NOT NULL,
      allowance TEXT NOT NULL,
      bonuses TEXT NOT NULL,
      deductions TEXT NOT NULL,
      netSalary TEXT NOT NULL,
      paymentStatus TEXT NOT NULL,
      lastPaymentDate TEXT NOT NULL,
      workDetails TEXT, -- JSON string
      history TEXT -- JSON string
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      assignedTo TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      dueDate TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      userRole TEXT NOT NULL,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      requestedBy TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  // Seed Users if empty
  const userCheck = await db.get('SELECT count(*) as count FROM users');
  if (userCheck.count === 0) {
    console.log('Seeding users table...');
    const rawUsers = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'users.json'), 'utf8'));
    
    // Add additional users defined in the original frontend service
    const fullUsers = [
      ...rawUsers,
      {
        "id": 4,
        "name": "Sam Inventory",
        "email": "inventory@rugfactory.com",
        "role": "Inventory Manager",
        "status": "Active"
      },
      {
        "id": 5,
        "name": "Sarah Sales",
        "email": "sales@rugfactory.com",
        "role": "Sales Manager",
        "status": "Active"
      }
    ];

    for (const u of fullUsers) {
      const plainPassword = u.role === 'Admin' ? 'admin123' : 'password123';
      const hashedPassword = bcrypt.hashSync(plainPassword, 10);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`;
      
      await db.run(
        'INSERT INTO users (id, name, email, role, status, password, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [u.id.toString(), u.name, u.email, u.role, u.status, hashedPassword, avatar]
      );
    }
  }

  // Seed Products
  const prodCheck = await db.get('SELECT count(*) as count FROM products');
  if (prodCheck.count === 0) {
    console.log('Seeding products table...');
    const prods = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'products.json'), 'utf8'));
    for (const p of prods) {
      await db.run(
        'INSERT INTO products (id, name, description, price, dimensions, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.description, p.price, p.dimensions, p.stock, p.image]
      );
    }
  }

  // Seed Orders
  const orderCheck = await db.get('SELECT count(*) as count FROM orders');
  if (orderCheck.count === 0) {
    console.log('Seeding orders table...');
    const orders = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'orders.json'), 'utf8'));
    for (const o of orders) {
      await db.run(
        'INSERT INTO orders (id, customerName, email, product, datePlaced, amount, status, timelineStep, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [o.id, o.customerName, o.email, o.product, o.datePlaced, o.amount, o.status, o.timelineStep, o.paymentStatus]
      );
    }
  }

  // Seed Inventory
  const invCheck = await db.get('SELECT count(*) as count FROM inventory');
  if (invCheck.count === 0) {
    console.log('Seeding inventory table...');
    const inv = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'inventory.json'), 'utf8'));
    for (const i of inv) {
      await db.run(
        'INSERT INTO inventory (id, name, category, quantity, unit, status, lastRestock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [i.id, i.name, i.category, i.quantity, i.unit, i.status, i.lastRestock]
      );
    }
  }

  // Seed Usage Logs
  const usageCheck = await db.get('SELECT count(*) as count FROM usage_logs');
  if (usageCheck.count === 0) {
    console.log('Seeding usage_logs table...');
    const logs = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'usageLogs.json'), 'utf8'));
    for (const l of logs) {
      await db.run(
        'INSERT INTO usage_logs (id, materialId, materialName, quantityUsed, unit, taskRef, usedBy, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [l.id, l.materialId, l.materialName, l.quantityUsed, l.unit, l.taskRef, l.usedBy, l.date]
      );
    }
  }

  // Seed Supply Orders
  const supplyCheck = await db.get('SELECT count(*) as count FROM supply_orders');
  if (supplyCheck.count === 0) {
    console.log('Seeding supply_orders table...');
    const orders = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'supplyOrders.json'), 'utf8'));
    for (const o of orders) {
      await db.run(
        'INSERT INTO supply_orders (id, factoryRef, material, quantity, dateRequested, status, amount, eta, shippingCarrier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [o.id, o.factoryRef, o.material, o.quantity, o.dateRequested, o.status, o.amount, o.eta || null, o.shippingCarrier || null]
      );
    }
  }

  // Seed Salaries
  const salCheck = await db.get('SELECT count(*) as count FROM salaries');
  if (salCheck.count === 0) {
    console.log('Seeding salaries table...');
    const salariesList = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'salaries.json'), 'utf8'));
    for (const s of salariesList) {
      await db.run(
        'INSERT INTO salaries (userId, baseSalary, allowance, bonuses, deductions, netSalary, paymentStatus, lastPaymentDate, workDetails, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          s.userId,
          s.baseSalary,
          s.allowance,
          s.bonuses,
          s.deductions,
          s.netSalary,
          s.paymentStatus,
          s.lastPaymentDate,
          s.workDetails ? JSON.stringify(s.workDetails) : null,
          s.history ? JSON.stringify(s.history) : null
        ]
      );
    }
  }

  // Seed Tasks
  const taskCheck = await db.get('SELECT count(*) as count FROM tasks');
  if (taskCheck.count === 0) {
    console.log('Seeding tasks table...');
    const tasks = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'tasks.json'), 'utf8'));
    for (const t of tasks) {
      await db.run(
        'INSERT INTO tasks (id, title, description, category, assignedTo, priority, status, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.title, t.description, t.category, t.assignedTo, t.priority, t.status, t.dueDate]
      );
    }
  }

  // Seed Audit Logs
  const auditCheck = await db.get('SELECT count(*) as count FROM audit_logs');
  if (auditCheck.count === 0) {
    console.log('Seeding audit_logs table...');
    const initialLogs = [
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

    for (const l of initialLogs) {
      await db.run(
        'INSERT INTO audit_logs (id, timestamp, user, userRole, module, action, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [l.id, l.timestamp, l.user, l.userRole, l.module, l.action, l.description]
      );
    }
  }

  // Seed Approvals
  const appCheck = await db.get('SELECT count(*) as count FROM approvals');
  if (appCheck.count === 0) {
    console.log('Seeding approvals table...');
    const initialApprovals = [
      { id: 'REQ-01', subject: 'New Supplier Registration: Elite Wools', requestedBy: 'Jane Manager', date: '2023-10-24', status: 'Pending', description: 'Requesting approval for a new wool supplier based in New Zealand.' },
      { id: 'REQ-02', subject: 'Override Production Limit', requestedBy: 'Bill Worker', date: '2023-10-25', status: 'Pending', description: 'Need to override the limit for the current night shift to meet deadline.' },
      { id: 'REQ-03', subject: 'Budget Extension: Sales Team', requestedBy: 'Mark Sales', date: '2023-10-26', status: 'Approved', description: 'Quarterly budget extension for regional marketing campaign.' },
      { id: 'REQ-04', subject: 'Emergency Leave Request', requestedBy: 'John Dave', date: '2023-10-27', status: 'Rejected', description: 'Requesting leave for personal reasons during peak production week.' }
    ];

    for (const app of initialApprovals) {
      await db.run(
        'INSERT INTO approvals (id, subject, requestedBy, date, status, description) VALUES (?, ?, ?, ?, ?, ?)',
        [app.id, app.subject, app.requestedBy, app.date, app.status, app.description]
      );
    }
  }

  console.log('Database initialized successfully.');
  await db.close();
}
