// src/routes/tracking.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /tracking/:companyId/:code
router.get(
  '/tracking/:companyId/:code',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, code } = req.params;

      const lead = await prisma.lead.findFirst({
        where: { trackingCode: code, companyId },
        include: { items: true, history: true },
      });

      if (!lead) {
        return res.status(404).json({ error: 'Lead não encontrado' });
      }

      // === serialização filtrada ===
      function serialize(obj: any): any {
        // campos que não queremos expor
        const excluded = new Set(['id', 'companyId', 'gateway', 'gatewayTxId', 'leadId']);
        if (typeof obj === 'bigint') {
          return obj.toString();
        }
        if (Array.isArray(obj)) {
          return obj.map(serialize);
        }
        if (obj && typeof obj === 'object') {
          return Object.entries(obj).reduce((acc, [key, value]) => {
            if (excluded.has(key)) return acc;
            acc[key] = serialize(value);
            return acc;
          }, {} as any);
        }
        return obj;
      }

      // envia apenas os campos permitidos
      res.json(serialize(lead));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
