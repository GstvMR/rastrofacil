// src/routes/lead.routes.ts
import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { requireAuth } from '../middlewares/requireAuth'
import { LeadStatus } from '@prisma/client'

const router = Router()

// Validação completa do payload de criação de lead
const leadSchema = z.object({
  companyId:         z.string().uuid(),
  addressZipcode:    z.string().regex(/^\d{5}-?\d{3}$/),
  estimatedDelivery: z.string().optional(), // ISO date
  orderNumber:       z.number().int(),
  valueTotal:        z.number(),
  valueProducts:     z.number(),
  valueShipment:     z.number(),
  valueDiscount:     z.number(),
  daysDelivery:      z.string(),
  gateway:           z.string(),
  paymentMethod:     z.string(),
  billetBarcode:     z.string().nullable().optional(),
  gatewayTxId:       z.string().uuid().optional(),
  customerFirstName: z.string(),
  customerLastName:  z.string(),
  customerDoc:       z.string(),
  customerEmail:     z.string().email(),
  customerPhone:     z.string(),
  addressStreet:        z.string(),
  addressNumber:        z.string(),
  addressNeighborhood:  z.string(),
  addressReceiver:      z.string(),
  addressCity:          z.string(),
  addressUf:            z.string(),
  items: z.array(
    z.object({
      name:            z.string(),
      variation:       z.string().optional(),
      sourceReference: z.union([z.string(), z.number()]).optional(),
      quantity:        z.number().int(),
      price:           z.number(),
    })
  ),
})

// POST /leads ─ cria lead + items + histórico inicial
router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = leadSchema.parse(req.body)

      // busca prefixo da empresa
      const company = await prisma.company.findUnique({
        where: { id: payload.companyId },
        select: { prefix: true },
      })
      if (!company) return res.status(404).json({ error: 'Empresa não encontrada' })

      // gera trackingCode
      const trackingCode = `${company.prefix ?? ''}-${Math.random()
        .toString(36)
        .substr(2, 8)
        .toUpperCase()}`

      // cria lead e items em transação
      const lead = await prisma.$transaction(async (tx) => {
        const newLead = await tx.lead.create({
          data: {
            companyId:           payload.companyId,
            trackingCode,
            status:             'purchase',
            orderNumber:        payload.orderNumber,
            valueTotal:         payload.valueTotal,
            valueProducts:      payload.valueProducts,
            valueShipment:      payload.valueShipment,
            valueDiscount:      payload.valueDiscount,
            daysDelivery:       payload.daysDelivery,
            estimatedDelivery:  payload.estimatedDelivery
              ? new Date(payload.estimatedDelivery)
              : undefined,
            gateway:            payload.gateway,
            paymentMethod:      payload.paymentMethod,
            billetBarcode:      payload.billetBarcode,
            gatewayTxId:        payload.gatewayTxId,
            customerFirstName:  payload.customerFirstName,
            customerLastName:   payload.customerLastName,
            customerDoc:        payload.customerDoc,
            customerEmail:      payload.customerEmail,
            customerPhone:      payload.customerPhone,
            addressStreet:      payload.addressStreet,
            addressNumber:      payload.addressNumber,
            addressNeighborhood:payload.addressNeighborhood,
            addressReceiver:    payload.addressReceiver,
            addressZipcode:     payload.addressZipcode,
            addressCity:        payload.addressCity,
            addressUf:          payload.addressUf,
            // originCep usa default definido no Prisma
            items: {
              create: payload.items.map((item) => ({
                name:            item.name,
                variation:       item.variation,
                sourceReference: item.sourceReference?.toString(),
                quantity:        item.quantity,
                price:           item.price,
              })),
            },
          },
          include: { items: true },
        })

        // histórico inicial
        await tx.leadStatusHistory.create({
          data: { leadId: newLead.id, status: 'purchase' },
        })

        return newLead
      })

      res.status(201).json(lead)
    } catch (err) {
      next(err)
    }
  }
)

// GET /leads/:leadId ─ busca lead + histórico + items
router.get(
  '/:leadId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { history: true, items: true },
      })
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })
      res.json(lead)
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /leads/:leadId/next-status ─ avança etapa
router.patch(
  '/:leadId/next-status',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params
      const lead = await prisma.lead.findUnique({ where: { id: leadId } })
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado' })

      const order: LeadStatus[] = [
        'purchase',
        'sorting',
        'in_transit',
        'delivered',
        'failed',
        'retry',
      ]
      const idx = order.indexOf(lead.status)
      const next = order[Math.min(idx + 1, order.length - 1)]

      const updated = await prisma.lead.update({
        where: { id: lead.id },
        data: { status: next },
      })
      await prisma.leadStatusHistory.create({
        data: { leadId: updated.id, status: next },
      })

      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /leads/:leadId/status ─ define etapa qualquer
router.patch(
  '/:leadId/status',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params
      const payload = z
        .object({ status: z.nativeEnum(LeadStatus) })
        .parse(req.body)

      const updated = await prisma.lead.update({
        where: { id: leadId },
        data: { status: payload.status },
      })
      await prisma.leadStatusHistory.create({
        data: { leadId: updated.id, status: payload.status },
      })
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
)

export default router

