import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

const createUploadDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadDir = 'uploads/';
    const mimetype = file.mimetype;

    if (file.fieldname === 'featuredImage') {
      uploadDir += 'blog-images/';
    } else if (mimetype.startsWith('video/')) {
      uploadDir += 'videos/';
    } else if (mimetype.startsWith('image/')) {
      uploadDir += 'images/';
    } else if (mimetype === 'application/pdf') {
      uploadDir += 'documents/';
    } else {
      uploadDir += 'misc/';
    }

    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedDocTypes = ['application/pdf'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes, ...allowedVideoTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError('Only images (JPEG, PNG, WebP), videos (MP4, WebM, OGG) and PDF files are allowed!', 400) as unknown as null, false);
  }
};

const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
// Hero background videos are much larger than images/docs, so uploads that can
// include video files get a higher ceiling than the default.
const maxMediaFileSize = Number(process.env.MAX_VIDEO_FILE_SIZE) || 100 * 1024 * 1024;

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

const uploadMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMediaFileSize },
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount = 10) =>
  upload.array(fieldName, maxCount);
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

/**
 * Same as uploadFields but with a raised file-size limit, for routes that accept video uploads.
 * Wraps multer's callback so MulterError (e.g. file-too-large) is converted into an AppError
 * instead of being passed through as a non-operational error (generic 500 in production).
 */
export const uploadMediaFields = (fields: multer.Field[]) => {
  const handler = uploadMedia.fields(fields);
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, (err: unknown) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxMb = Math.floor(maxMediaFileSize / (1024 * 1024));
          return next(createError(`File too large. Maximum allowed size is ${maxMb}MB.`, 413));
        }
        return next(createError(err.message, 400));
      }

      next(err);
    });
  };
};
