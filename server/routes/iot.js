import { seedHistory } from '../services/seedService.js';
import { Router } from 'express';
import { simulateOnce } from '../services/iotService.js';
import { SKENARIO } from '../services/scenarios.js';

// Dipasang di index.js: app.use('/api/iot', iotRoutes(repo))
export default function iotRoutes(repo) {
  const router = Router();

  router.post('/simulate', async (req, res) => {
    try {
      const userId = Number(req.body?.userId);
      const skenario = req.body?.skenario || 'acak';

      if (!Number.isInteger(userId) || userId < 1) {
        return res.status(400).json({ success: false, error: 'userId wajib berupa angka' });
      }
      if (!SKENARIO[skenario]) {
        return res.status(400).json({ success: false, error: `Skenario tidak dikenal: ${skenario}` });
      }
      if (!(await repo.userExists(userId))) {
        return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
      }

      const result = await simulateOnce(repo, userId, { skenario });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

    router.post('/seed', async (req, res) => {
    try {
      const userId = Number(req.body?.userId);
      const days = Number(req.body?.days ?? 7);
      const pattern = req.body?.pattern || 'fluktuatif';
      const reset = req.body?.reset !== false;

      if (!Number.isInteger(userId) || userId < 1) {
        return res.status(400).json({ success: false, error: 'userId wajib berupa angka' });
      }
      if (!(await repo.userExists(userId))) {
        return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
      }

      const result = await seedHistory(repo, userId, { days, pattern, reset });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      const salahInput = /days harus|Pola tidak dikenal/.test(error.message);
      res.status(salahInput ? 400 : 500).json({ success: false, error: error.message });
    }
  });

  return router;
}