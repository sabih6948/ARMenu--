import express from 'express';
import { getQrCode } from '../controllers/qrController.js';

const router = express.Router();

router.get('/', getQrCode);

export default router;