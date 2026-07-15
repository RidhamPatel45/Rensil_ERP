import Salary from '../models/Salary.js';
import User from '../models/User.js';

export async function getSalaries(req, res, next) {
  try {
    const salaries = await Salary.find({});
    const users = await User.find({}, 'id name email role');
    
    const enriched = salaries.map(s => {
      const u = users.find(u => u.id.toString() === s._id.toString());
      const salObj = s.toObject();
      return {
        ...salObj,
        userName: u ? u.name : (salObj.role || 'Unknown'),
        userEmail: u ? u.email : 'N/A',
        role: u ? u.role : (salObj.role || 'Staff'),
        workDetails: salObj.workDetails,
        history: salObj.history || []
      };
    });
    res.json(enriched);
  } catch (error) {
    next(error);
  }
}

export async function getMySalary(req, res, next) {
  try {
    const s = await Salary.findOne({ _id: req.params.userId });
    if (!s) {
      return res.json(null);
    }
    res.json(s);
  } catch (error) {
    next(error);
  }
}

export async function updatePayout(req, res, next) {
  const { status } = req.body;
  try {
    const today = new Date().toISOString().split('T')[0];
    await Salary.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: { paymentStatus: status, lastPaymentDate: today } }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
