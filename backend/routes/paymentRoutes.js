import { Router } from 'express';
import { createCheckoutSession, verifyPremium } from '../controllers/paymentController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.post('/create-checkout-session', requireAuth, createCheckoutSession);
router.post('/verify', requireAuth, verifyPremium);

export default router;