import { Router } from 'express'
import prisma from '../prisma'

const router = Router()

// GET /track/:code
router.get('/:trackingCode', async (req, res, next) => {
  try {
    const { trackingCode } = req.params
    const lead = await prisma.lead.findUnique({
      where: { trackingCode },
      include: {
        route: {
          include: { stops: true }
        }
      }
    })
    if (!lead) return res.status(404).json({ error: 'Código não encontrado' })
    res.json({
      trackingCode: lead.trackingCode,
      status: lead.status,
      route: lead.route
    })
  } catch (err) {
    next(err)
  }
})

export default router
