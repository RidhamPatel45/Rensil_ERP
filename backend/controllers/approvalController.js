import Approval from '../models/Approval.js';

export async function getApprovals(req, res, next) {
  try {
    const approvals = await Approval.find({}).sort({ date: -1 });
    res.json(approvals);
  } catch (error) {
    next(error);
  }
}

export async function createApproval(req, res, next) {
  const { subject, requestedBy, description } = req.body;
  try {
    const count = await Approval.countDocuments();
    const id = `REQ-${String(count + 1).padStart(2, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    const newApproval = await Approval.create({
      _id: id,
      subject,
      requestedBy,
      date,
      status: 'Pending',
      description
    });

    res.status(201).json(newApproval);
  } catch (error) {
    next(error);
  }
}

export async function updateApprovalStatus(req, res, next) {
  const { status } = req.body;
  try {
    await Approval.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status } }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
