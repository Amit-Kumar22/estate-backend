import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Review from '../models/Review';
import ReviewOTP from '../models/ReviewOTP';
import { catchAsync, createError } from '../middlewares/errorHandler';
import { sendOTPEmail, sendReviewNotification } from '../services/emailService';

const OTP_EXPIRY_MINUTES = 10;

// ── Public: Send OTP ────────────────────────────────────────────────────────
export const sendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError('Please provide a valid email address.', 400);
  }

  // Delete any existing unverified OTPs for this email
  await ReviewOTP.deleteMany({ email: email.toLowerCase() });

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await ReviewOTP.create({ email: email.toLowerCase(), otp, expiresAt });
  await sendOTPEmail(email, otp);

  res.status(200).json({
    status: 'success',
    message: `OTP sent to ${email}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  });
});

// ── Public: Verify OTP ──────────────────────────────────────────────────────
export const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw createError('Email and OTP are required.', 400);

  const record = await ReviewOTP.findOne({
    email: email.toLowerCase(),
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) throw createError('OTP is invalid or has expired.', 400);
  if (record.otp !== otp.toString()) throw createError('Incorrect OTP. Please try again.', 400);

  record.verified = true;
  record.verifiedAt = new Date();
  await record.save();

  // Issue a short-lived token so the review submission knows email was verified
  const reviewToken = jwt.sign(
    { email: email.toLowerCase(), purpose: 'review' },
    process.env.JWT_SECRET as string,
    { expiresIn: '30m' }
  );

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully.',
    data: { reviewToken },
  });
});

// ── Public: Submit Review ───────────────────────────────────────────────────
export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { name, email, city, rating, review, reviewToken } = req.body;

  if (!reviewToken) throw createError('Email verification is required.', 403);

  let decoded: { email: string; purpose: string };
  try {
    decoded = jwt.verify(reviewToken, process.env.JWT_SECRET as string) as typeof decoded;
  } catch {
    throw createError('Verification token is invalid or expired. Please verify your email again.', 403);
  }

  if (decoded.purpose !== 'review' || decoded.email !== email?.toLowerCase()) {
    throw createError('Verification token does not match the provided email.', 403);
  }

  if (!name?.trim()) throw createError('Name is required.', 400);
  if (!rating || rating < 1 || rating > 5) throw createError('Rating must be between 1 and 5.', 400);
  if (!review?.trim()) throw createError('Review text is required.', 400);

  const newReview = await Review.create({
    name: name.trim(),
    email: email.toLowerCase(),
    city: city?.trim(),
    rating: Number(rating),
    review: review.trim(),
    status: 'pending',
    emailVerified: true,
  });

  await sendReviewNotification({
    name: newReview.name,
    email: newReview.email,
    city: newReview.city,
    rating: newReview.rating,
    review: newReview.review,
  }).catch(console.error);

  res.status(201).json({
    status: 'success',
    message: 'Thank you for your review! It will be visible after admin approval.',
    data: { review: { id: newReview.id } },
  });
});

// ── Public: Get Approved Reviews ────────────────────────────────────────────
export const getPublicReviews = catchAsync(async (_req: Request, res: Response) => {
  const reviews = await Review.find({ status: 'approved' })
    .select('name city rating review createdAt')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

// ── Admin: Get All Reviews ──────────────────────────────────────────────────
export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { review: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [reviews, total] = await Promise.all([
    Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Review.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    data: { reviews },
  });
});

// ── Admin: Update Review Status ─────────────────────────────────────────────
export const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    throw createError('Status must be approved, rejected, or pending.', 400);
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!review) throw createError('Review not found.', 404);

  res.status(200).json({
    status: 'success',
    message: `Review ${status} successfully.`,
    data: { review },
  });
});

// ── Admin: Delete Review ────────────────────────────────────────────────────
export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw createError('Review not found.', 404);

  res.status(200).json({ status: 'success', message: 'Review deleted successfully.' });
});
