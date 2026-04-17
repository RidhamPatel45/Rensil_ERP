import usersData from '../mockData/users.json';
import { auditService } from './auditService';

// Initialize in-memory users with passwords
let memUsers = [
  ...usersData,
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
].map(u => ({
  ...u,
  password: u.role === 'Admin' ? 'admin123' : 'password123',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
}));

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  login: async (email, password) => {
    await delay(1000);
    const user = memUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      auditService.logAction('Security', 'Failed Login', `Unauthorized attempt using email: ${email}`);
      throw new Error('Invalid email or password');
    }
    const { password: _, ...userWithoutPassword } = user;
    auditService.logAction('Security', 'User Login', `User logged in as ${user.role}`);
    return userWithoutPassword;
  },

  getUsers: async () => {
    await delay(500);
    return memUsers;
  },
  
  addUser: async (userData) => {
    await delay(500);
    const newUser = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-4)}`,
      status: 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`
    };
    memUsers = [newUser, ...memUsers];
    auditService.logAction('Admin', 'User Created', `Added new user ${newUser.name} as ${newUser.role}`);
    return newUser;
  },

  updateUser: async (id, updates) => {
    await delay(300);
    memUsers = memUsers.map(u => u.id === id ? { ...u, ...updates } : u);
    return memUsers.find(u => u.id === id);
  },

  getUserById: async (id) => {
    await delay(300);
    return memUsers.find(u => u.id === id);
  }
};
