import { Request, Response } from 'express';
import Admin from '../models/Admin';
import { signToken, sendTokenCookie, clearTokenCookie } from '../utils/jwt';
import { catchAsync, createError } from '../middlewares/errorHandler';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Please provide email and password.', 400);
  }

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    throw createError('Invalid email or password.', 401);
  }

  if (!admin.isActive) {
    throw createError('Your account has been deactivated. Contact support.', 403);
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
  sendTokenCookie(res, token);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
    data: {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  clearTokenCookie(res);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const admin = await Admin.findById(req.admin?.id);
  if (!admin) throw createError('Admin not found.', 404);

  res.status(200).json({
    status: 'success',
    data: { admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } },
  });
});

export const updatePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin?.id).select('+password');
  if (!admin) throw createError('Admin not found.', 404);

  if (!(await admin.comparePassword(currentPassword))) {
    throw createError('Current password is incorrect.', 401);
  }

  admin.password = newPassword;
  await admin.save();

  const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
  sendTokenCookie(res, token);

  res.status(200).json({ status: 'success', message: 'Password updated successfully', token });
});

export const getAdmins = catchAsync(async (_req: Request, res: Response) => {
  const admins = await Admin.find().select('-password');
  res.status(200).json({ status: 'success', results: admins.length, data: { admins } });
});

export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const existing = await Admin.findOne({ email });
  if (existing) throw createError('An admin with this email already exists.', 400);

  const admin = await Admin.create({ name, email, password, role });
  res.status(201).json({
    status: 'success',
    data: { admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } },
  });
});

export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { name, email, isActive } = req.body;
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { name, email, isActive },
    { new: true, runValidators: true }
  );
  if (!admin) throw createError('Admin not found.', 404);
  res.status(200).json({ status: 'success', data: { admin } });
});

export const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw createError('Admin not found.', 404);
  if (admin.id === req.admin?.id) throw createError('You cannot delete your own account.', 400);
  await Admin.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'Admin deleted successfully' });
});
