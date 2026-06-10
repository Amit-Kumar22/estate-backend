import { Request, Response } from 'express';
import Lead from '../models/Lead';
import { catchAsync, createError } from '../middlewares/errorHandler';
import { sendLeadNotification } from '../services/emailService';
import Project from '../models/Project';

export const createLead = catchAsync(async (req: Request, res: Response) => {
  const { name, mobile, email, source, projectId, message, unlockedContent } = req.body;

  let projectName: string | undefined;
  if (projectId) {
    const project = await Project.findById(projectId).select('name brochureUrl');
    if (project) projectName = project.name;

    // Return brochure URL for brochure leads
    if (source === 'brochure' && project?.brochureUrl) {
      const lead = await Lead.create({
        name, mobile, email, source, project: projectId, projectName,
        ipAddress: req.ip, userAgent: req.get('User-Agent'),
      });
      await sendLeadNotification({ name, email, mobile, source, projectName }).catch(console.error);
      return res.status(201).json({
        status: 'success',
        message: 'Lead captured successfully',
        data: { lead: { id: lead.id }, brochureUrl: project.brochureUrl },
      });
    }
  }

  const lead = await Lead.create({
    name, mobile, email, source, project: projectId, projectName,
    message, unlockedContent, ipAddress: req.ip, userAgent: req.get('User-Agent'),
  });

  await sendLeadNotification({ name, email, mobile, source, projectName, message }).catch(console.error);

  res.status(201).json({
    status: 'success',
    message: 'Thank you! We will contact you soon.',
    data: { lead: { id: lead.id } },
  });
});

export const getAllLeads = catchAsync(async (req: Request, res: Response) => {
  const { source, projectId, search, page = 1, limit = 20, startDate, endDate } = req.query;
  const query: Record<string, unknown> = {};

  if (source) query.source = source;
  if (projectId) query.project = projectId;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      (query.createdAt as Record<string, unknown>).$lte = end;
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('project', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Lead.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: leads.length,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    data: { leads },
  });
});

export const getLeadById = catchAsync(async (req: Request, res: Response) => {
  const lead = await Lead.findById(req.params.id).populate('project', 'name slug');
  if (!lead) throw createError('Lead not found.', 404);
  res.status(200).json({ status: 'success', data: { lead } });
});

export const deleteLead = catchAsync(async (req: Request, res: Response) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) throw createError('Lead not found.', 404);
  res.status(200).json({ status: 'success', message: 'Lead deleted successfully' });
});

export const exportLeadsCSV = catchAsync(async (req: Request, res: Response) => {
  const { source, startDate, endDate } = req.query;
  const query: Record<string, unknown> = {};

  if (source) query.source = source;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
    if (endDate) (query.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
  }

  const leads = await Lead.find(query).populate('project', 'name').sort({ createdAt: -1 });

  const csvHeader = 'Name,Email,Mobile,Source,Project,Message,Date\n';
  const csvRows = leads.map((l) => {
    const project = (l.project as unknown as { name: string } | null)?.name || l.projectName || '-';
    const date = new Date(l.createdAt).toLocaleDateString('en-IN');
    return `"${l.name}","${l.email}","${l.mobile}","${l.source}","${project}","${l.message || ''}","${date}"`;
  });

  const csv = csvHeader + csvRows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

export const getTodayLeads = catchAsync(async (_req: Request, res: Response) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const leads = await Lead.find({ createdAt: { $gte: start, $lte: end } })
    .populate('project', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ status: 'success', results: leads.length, data: { leads } });
});
