import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockDataPath = path.resolve(__dirname, '../mockData');

// Import models dynamically to avoid circular dependencies during initialization
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import UsageLog from '../models/UsageLog.js';
import SupplyOrder from '../models/SupplyOrder.js';
import Salary from '../models/Salary.js';
import Task from '../models/Task.js';
import Approval from '../models/Approval.js';
import AuditLog from '../models/AuditLog.js';

export async function connectDB() {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rensil_erp';
  
  try {
    const conn = await mongoose.connect(connString);
    console.log(`\n🔋 MongoDB Connected: ${conn.connection.host}`);
    
    // Seed DB
    await seedDatabase();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    // 1. Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding users collection...');
      const rawUsers = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'users.json'), 'utf8'));
      const fullUsers = [
        ...rawUsers,
        { id: 4, name: 'Sam Inventory', email: 'inventory@rensil.com', role: 'Inventory Manager', status: 'Active' },
        { id: 5, name: 'Sarah Sales', email: 'sales@rensil.com', role: 'Sales Manager', status: 'Active' }
      ];
      
      for (const u of fullUsers) {
        const plain = u.role === 'Admin' ? 'admin123' : 'password123';
        const hashed = bcrypt.hashSync(plain, 10);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`;
        
        // Use custom string id as _id
        await User.create({
          _id: u.id.toString(),
          name: u.name,
          email: u.email.replace('rugfactory.com', 'rensil.com'),
          role: u.role,
          status: u.status,
          password: hashed,
          avatar
        });
      }
      console.log('✅ Users seeded.');
    }

    // 2. Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding products collection...');
      const prods = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'products.json'), 'utf8'));
      for (const p of prods) {
        await Product.create({
          _id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          dimensions: p.dimensions,
          stock: p.stock,
          image: p.image
        });
      }
      console.log('✅ Products seeded.');
    }

    // 3. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('Seeding orders collection...');
      const orders = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'orders.json'), 'utf8'));
      for (const o of orders) {
        await Order.create({
          _id: o.id,
          customerName: o.customerName,
          email: o.email.replace('rugfactory.com', 'rensil.com'),
          product: o.product,
          datePlaced: o.datePlaced,
          amount: o.amount,
          status: o.status,
          timelineStep: o.timelineStep,
          paymentStatus: o.paymentStatus
        });
      }
      console.log('✅ Orders seeded.');
    }

    // 4. Inventory
    const invCount = await Inventory.countDocuments();
    if (invCount === 0) {
      console.log('Seeding inventory collection...');
      const inv = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'inventory.json'), 'utf8'));
      for (const i of inv) {
        await Inventory.create({
          _id: i.id,
          name: i.name,
          category: i.category,
          quantity: i.quantity,
          unit: i.unit,
          status: i.status,
          lastRestock: i.lastRestock
        });
      }
      console.log('✅ Inventory seeded.');
    }

    // 5. Usage Logs
    const usageCount = await UsageLog.countDocuments();
    if (usageCount === 0) {
      console.log('Seeding usage logs collection...');
      const logs = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'usageLogs.json'), 'utf8'));
      for (const l of logs) {
        await UsageLog.create({
          _id: l.id,
          materialId: l.materialId,
          materialName: l.materialName,
          quantityUsed: l.quantityUsed,
          unit: l.unit,
          taskRef: l.taskRef,
          usedBy: l.usedBy,
          date: l.date
        });
      }
      console.log('✅ Usage logs seeded.');
    }

    // 6. Supply Orders
    const supplyCount = await SupplyOrder.countDocuments();
    if (supplyCount === 0) {
      console.log('Seeding supply orders collection...');
      const supply = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'supplyOrders.json'), 'utf8'));
      for (const s of supply) {
        await SupplyOrder.create({
          _id: s.id,
          factoryRef: s.factoryRef.replace('Rug Factory', 'Rensil ERP'),
          material: s.material,
          quantity: s.quantity,
          dateRequested: s.dateRequested,
          status: s.status,
          amount: s.amount,
          eta: s.eta || null,
          shippingCarrier: s.shippingCarrier || null
        });
      }
      console.log('✅ Supply orders seeded.');
    }

    // 7. Salaries
    const salaryCount = await Salary.countDocuments();
    if (salaryCount === 0) {
      console.log('Seeding salaries collection...');
      const salariesList = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'salaries.json'), 'utf8'));
      for (const s of salariesList) {
        await Salary.create({
          _id: s.userId.toString(), // Store as userId
          baseSalary: s.baseSalary,
          allowance: s.allowance,
          bonuses: s.bonuses,
          deductions: s.deductions,
          netSalary: s.netSalary,
          paymentStatus: s.paymentStatus,
          lastPaymentDate: s.lastPaymentDate,
          workDetails: s.workDetails || null,
          history: s.history || []
        });
      }
      console.log('✅ Salaries seeded.');
    }

    // 8. Tasks
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      console.log('Seeding tasks collection...');
      const tasks = JSON.parse(fs.readFileSync(path.join(mockDataPath, 'tasks.json'), 'utf8'));
      for (const t of tasks) {
        await Task.create({
          _id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          assignedTo: t.assignedTo,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate
        });
      }
      console.log('✅ Tasks seeded.');
    }

    // 9. Approvals
    const approvalCount = await Approval.countDocuments();
    if (approvalCount === 0) {
      console.log('Seeding approvals collection...');
      const initialApprovals = [
        { id: 'REQ-01', subject: 'New Supplier Registration: Elite Wools', requestedBy: 'Jane Manager', date: '2023-10-24', status: 'Pending', description: 'Requesting approval for a new wool supplier based in New Zealand.' },
        { id: 'REQ-02', subject: 'Override Production Limit', requestedBy: 'Bill Worker', date: '2023-10-25', status: 'Pending', description: 'Need to override the limit for the current night shift to meet deadline.' },
        { id: 'REQ-03', subject: 'Budget Extension: Sales Team', requestedBy: 'Mark Sales', date: '2023-10-26', status: 'Approved', description: 'Quarterly budget extension for regional marketing campaign.' },
        { id: 'REQ-04', subject: 'Emergency Leave Request', requestedBy: 'John Dave', date: '2023-10-27', status: 'Rejected', description: 'Requesting leave for personal reasons during peak production week.' }
      ];
      for (const app of initialApprovals) {
        await Approval.create({
          _id: app.id,
          subject: app.subject,
          requestedBy: app.requestedBy,
          date: app.date,
          status: app.status,
          description: app.description
        });
      }
      console.log('✅ Approvals seeded.');
    }

    // 10. Audit Logs
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      console.log('Seeding audit logs collection...');
      const initialLogs = [
        { id: 'LOG-006', timestamp: new Date(Date.now() - 1000*60*15).toISOString(), user: 'Sam Inventory', userRole: 'Inventory Manager', module: 'Inventory', action: 'Stock Replenished', description: 'Added 50 units of Premium Wool (Batch #882).' },
        { id: 'LOG-005', timestamp: new Date(Date.now() - 1000*60*45).toISOString(), user: 'Sarah Sales', userRole: 'Sales Manager', module: 'Sales', action: 'Payment Recorded', description: 'Marked Order ORD-772 as PAID (Amount: ₹12,400).' },
        { id: 'LOG-004', timestamp: new Date(Date.now() - 1000*60*120).toISOString(), user: 'Jane Manager', userRole: 'Manager', module: 'Manager', action: 'Task Assigned', description: 'Assigned "Quality Inspection" for Order #902 to Bill Worker.' },
        { id: 'LOG-003', timestamp: new Date(Date.now() - 1000*60*300).toISOString(), user: 'System Admin', userRole: 'Admin', module: 'Admin', action: 'User Updated', description: 'Updated permissions for Worker: Bill Worker.' },
        { id: 'LOG-002', timestamp: new Date(Date.now() - 1000*60*600).toISOString(), user: 'Bill Worker', userRole: 'Worker', module: 'Security', action: 'User Login', description: 'Successful login from IP: 192.168.1.42.' },
        { id: 'LOG-001', timestamp: new Date(Date.now() - 1000*60*1440).toISOString(), user: 'System', userRole: 'System', module: 'Core', action: 'System Boot', description: 'Rensil ERP System initialized successfully.' }
      ];
      for (const l of initialLogs) {
        await AuditLog.create({
          _id: l.id,
          timestamp: l.timestamp,
          user: l.user,
          userRole: l.userRole,
          module: l.module,
          action: l.action,
          description: l.description
        });
      }
      console.log('✅ Audit logs seeded.');
    }
    
    console.log('🚀 Database initialization complete.');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
}
