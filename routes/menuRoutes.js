import express from 'express';
import upload from '../config/multerConfig.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { getAllItems, getItemById, createItem, deleteItem } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getAllItems);         
router.get('/:id', getItemById);     
router.post('/', requireAuth, upload.single('modelFile'), createItem);   
router.delete('/:id', requireAuth, deleteItem);                  

export default router;