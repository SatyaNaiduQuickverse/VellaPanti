import { Router } from 'express';
import multer from 'multer';
import { uploadProductsFromExcel, downloadProductTemplate } from '../controllers/bulkUploadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticateToken);

// Download product upload template
router.get('/template', downloadProductTemplate);

// Upload products from Excel
router.post('/products', upload.single('file'), uploadProductsFromExcel);

export default router;