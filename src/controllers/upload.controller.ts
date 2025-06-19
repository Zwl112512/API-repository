// src/controllers/upload.controller.ts
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

// 設定儲存位置和檔名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 儲存到 uploads 資料夾
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// 過濾檔案類型
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png files are allowed!'));
  }
};

export const upload = multer({ storage, fileFilter }).single('image');

export const uploadImage = (req: Request, res: Response) => {
  upload(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: 'Image uploaded successfully', url: fileUrl });
  });
};
