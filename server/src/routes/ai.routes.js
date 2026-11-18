import express from 'express';
import { 
    chatWithAI, 
    getRecommendation 
} from '../controllers/ai.controller.js';


const router = express.Router();

router.post('/chat', chatWithAI);
router.post("/recommend", getRecommendation);

export default router;
