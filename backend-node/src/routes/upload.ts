import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  },
});

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  let extractedText = '';

  if (req.file.mimetype === 'application/pdf') {
    try {
      const buffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(buffer);
      extractedText = data.text.trim();
    } catch (err) {
      console.error('PDF parse error:', err);
    }
  }

  res.json({
    fileName: req.file.originalname,
    storedName: req.file.filename,
    extractedText,
  });
});

export default router;
