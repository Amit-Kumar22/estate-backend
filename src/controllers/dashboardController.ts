import { Request, Response } from 'express';
import Lead from '../models/Lead';
import Project from '../models/Project';
import { catchAsync } from '../middlewares/errorHandler';

export const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalProjects,
    totalLeads,
    todayLeads,
    brochureDownloads,
    contactRequests,
    unlockLeads,
  ] = await Promise.all([
    Project.countDocuments({ isActive: true }),
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
    Lead.countDocuments({ source: 'brochure' }),
    Lead.countDocuments({ source: 'contact' }),
    Lead.countDocuments({ source: 'unlock_content' }),
  ]);

  // Monthly leads chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyLeadsRaw = await Lead.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyLeads = monthlyLeadsRaw.map((item) => ({
    month: `${months[item._id.month - 1]} ${item._id.year}`,
    count: item.count,
  }));

  // Project-wise leads
  const projectWiseLeadsRaw = await Lead.aggregate([
    { $match: { project: { $exists: true, $ne: null } } },
    { $group: { _id: '$project', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'projectInfo',
      },
    },
    { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
  ]);

  const projectWiseLeads = projectWiseLeadsRaw.map((item) => ({
    project: item.projectInfo?.name || 'Unknown',
    count: item.count,
  }));

  // Recent leads
  const recentLeads = await Lead.find()
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalProjects,
        totalLeads,
        todayLeads,
        brochureDownloads,
        contactRequests,
        unlockLeads,
      },
      monthlyLeads,
      projectWiseLeads,
      recentLeads,
    },
  });
});
