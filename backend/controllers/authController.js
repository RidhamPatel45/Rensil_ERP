import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createAuditLog } from '../middleware/auditMiddleware.js';

export async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      await createAuditLog(req, 'Security', 'Failed Login', `Unauthorized attempt using email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    
    // Inject headers for the audit log of this specific request
    req.headers['x-user-name'] = user.name;
    req.headers['x-user-role'] = user.role;
    
    await createAuditLog(req, 'Security', 'User Login', `User logged in as ${user.role}`);
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await User.find({}, 'id name email role status avatar');
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  const { name, email, role, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashed = bcrypt.hashSync(password || 'password123', 10);
    const id = `USR-${Date.now().toString().slice(-4)}`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    const user = await User.create({
      _id: id,
      name,
      email,
      role,
      status: 'Active',
      password: hashed,
      avatar
    });

    await createAuditLog(req, 'Admin', 'User Created', `Added new user ${name} as ${role}`);
    
    const { password: _, ...createdUser } = user.toObject();
    res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  const updates = req.body;
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out password and ID updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (key !== 'password' && key !== '_id' && key !== 'id') {
        filteredUpdates[key] = updates[key];
      }
    });

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: filteredUpdates },
      { new: true }
    ).select('-password');

    await createAuditLog(req, 'Admin', 'User Updated', `Updated profile for ${updated.name}`);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
