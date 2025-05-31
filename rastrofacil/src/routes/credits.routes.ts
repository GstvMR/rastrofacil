import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { requireAuth } from '../middlewares/requireAuth'

const router = Router()
const schema = z.object({ amount: z.number().int().positive() })

router.post('/top-up', requireAuth, async (req, res) => {
  const { amount } = schema.parse(req.body)
  const userId = (req as any).user.sub

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    })
    await tx.creditHistory.create({
      data: { userId, delta: amount, reason: 'top_up', actor: userId },
    })
  })

  res.sendStatus(204)
})

export default router
