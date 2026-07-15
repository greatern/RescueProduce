import { Router } from 'express';
//import { authMiddleware } from '../middlewares/authMiddleware';
import { ReportController } from '../controllers/reportController';
ReportController

const router = Router();

router.post('/reports/:id', ReportController.generateReport);
router.get('/reports/download/:filename', ReportController.downloadReport);

export default router;