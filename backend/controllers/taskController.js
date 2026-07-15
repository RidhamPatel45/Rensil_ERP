import Task from '../models/Task.js';
import { createAuditLog } from '../middleware/auditMiddleware.js';

export async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({}).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function getTasksByAssignee(req, res, next) {
  try {
    const tasks = await Task.find({ assignedTo: req.params.name }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatus(req, res, next) {
  const { status } = req.body;
  try {
    await Task.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status } }
    );

    await createAuditLog(req, 'Manager', 'Task Progress', `Task ${req.params.id} status moved to ${status}`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
