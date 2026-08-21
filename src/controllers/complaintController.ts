import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Complaint from '../models/Complaint';
import ComplaintOTP from '../models/ComplaintOTP';
import { catchAsync, createError } from '../middlewares/errorHandler';
import { sendComplaintNotification, sendOTPEmail } from '../services/emailService';

const OTP_EXPIRY_MINUTES = 10;

// ── Public: Send OTP ────────────────────────────────────────────────────────
export const sendComplaintOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError('Please provide a valid email address.', 400);
  }

  // Delete any existing unverified OTPs for this email
  await ComplaintOTP.deleteMany({ email: email.toLowerCase() });

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await ComplaintOTP.create({ email: email.toLowerCase(), otp, expiresAt });
  await sendOTPEmail(email, otp);

  res.status(200).json({
    status: 'success',
    message: `OTP sent to ${email}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  });
});

// ── Public: Verify OTP ──────────────────────────────────────────────────────
export const verifyComplaintOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw createError('Email and OTP are required.', 400);

  const record = await ComplaintOTP.findOne({
    email: email.toLowerCase(),
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) throw createError('OTP is invalid or has expired.', 400);
  if (record.otp !== otp.toString()) throw createError('Incorrect OTP. Please try again.', 400);

  record.verified = true;
  record.verifiedAt = new Date();
  await record.save();

  // Issue a short-lived token so the complaint submission knows email was verified
  const complaintToken = jwt.sign(
    { email: email.toLowerCase(), purpose: 'complaint' },
    process.env.JWT_SECRET as string,
    { expiresIn: '30m' }
  );

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully.',
    data: { complaintToken },
  });
});

// ── Public: Submit Complaint ────────────────────────────────────────────────
export const createComplaint = catchAsync(async (req: Request, res: Response) => {
  const { name, email, mobile, subject, message, complaintToken } = req.body;

  if (!complaintToken) throw createError('Email verification is required.', 403);

  let decoded: { email: string; purpose: string };
  try {
    decoded = jwt.verify(complaintToken, process.env.JWT_SECRET as string) as typeof decoded;
  } catch {
    throw createError('Verification token is invalid or expired. Please verify your email again.', 403);
  }

  if (decoded.purpose !== 'complaint' || decoded.email !== email?.toLowerCase()) {
    throw createError('Verification token does not match the provided email.', 403);
  }

  if (!name?.trim()) throw createError('Name is required.', 400);
  if (!subject?.trim()) throw createError('Subject is required.', 400);
  if (!message?.trim()) throw createError('Complaint message is required.', 400);

  const complaint = await Complaint.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    mobile: mobile?.trim(),
    subject: subject.trim(),
    message: message.trim(),
    emailVerified: true,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  await sendComplaintNotification({
    name: complaint.name,
    email: complaint.email,
    mobile: complaint.mobile,
    subject: complaint.subject,
    message: complaint.message,
  }).catch(console.error);

  res.status(201).json({
    status: 'success',
    message: 'Your complaint has been submitted. Our team will get back to you soon.',
    data: { complaint: { id: complaint.id } },
  });
});

// ── Admin: Get All Complaints ───────────────────────────────────────────────
export const getAllComplaints = catchAsync(async (req: Request, res: Response) => {
  const { status, search, page = 1, limit = 20, startDate, endDate } = req.query;
  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
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
  const [complaints, total] = await Promise.all([
    Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Complaint.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    data: { complaints },
  });
});

// ── Admin: Get Complaint By Id ───────────────────────────────────────────────
export const getComplaintById = catchAsync(async (req: Request, res: Response) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw createError('Complaint not found.', 404);
  res.status(200).json({ status: 'success', data: { complaint } });
});

// ── Admin: Update Complaint Status / Note ───────────────────────────────────
export const updateComplaintStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, adminNote } = req.body;

  if (status && !['pending', 'in_progress', 'resolved'].includes(status)) {
    throw createError('Status must be pending, in_progress, or resolved.', 400);
  }

  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (adminNote !== undefined) update.adminNote = adminNote;

  const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!complaint) throw createError('Complaint not found.', 404);

  res.status(200).json({
    status: 'success',
    message: 'Complaint updated successfully.',
    data: { complaint },
  });
});

// ── Admin: Delete Complaint ─────────────────────────────────────────────────
export const deleteComplaint = catchAsync(async (req: Request, res: Response) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);
  if (!complaint) throw createError('Complaint not found.', 404);
  res.status(200).json({ status: 'success', message: 'Complaint deleted successfully.' });
});
