import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { createError } from './errorHandler';

const createUploadDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    let uploadDir = 'uploads/';
    const mimetype = file.mimetype;
    if (mimetype.startsWith('image/')) {
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
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError('Only images (JPEG, PNG, WebP) and PDF files are allowed!', 400) as unknown as null, false);
  }
};

const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount = 10) =>
  upload.array(fieldName, maxCount);
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);
