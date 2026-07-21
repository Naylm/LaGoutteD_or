import { Router } from 'express';
import { requireEditor } from '../middleware/auth.js';
import { getVapidPublicKey, saveSubscription } from '../push.js';

const router = Router();

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: getVapidPublicKey() });
});

router.post('/subscribe', requireEditor, async (req, res) => {
  try {
    await saveSubscription(req.body);
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
