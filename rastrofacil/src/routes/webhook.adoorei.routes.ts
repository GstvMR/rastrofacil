import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { createLead, NewLeadPayload } from '../services/lead.service'

const router = Router()

// Schema Zod para validação do payload da Adoorei
const adooreiPayloadSchema = z.object({
  event: z.string(),
  resource: z.object({
    number: z.number(),
    value_total: z.number(),
    value_products: z.number(),
    value_shipment: z.number(),
    value_discount: z.number(),
    days_delivery: z.string(),
    created_at: z.string().transform(s => new Date(s)),
    gateway: z.string(),
    payment_method: z.string(),
    gateway_transaction_id: z.string().optional().nullable(),
    billet_barcode: z.string().optional().nullable(),
    customer: z.object({
      first_name: z.string(),
      last_name: z.string(),
      doc: z.string(),
      email: z.string().email(),
      phone: z.string()
    }),
    address: z.object({
      street: z.string(),
      number: z.string(),
      neighborhood: z.string(),
      receiver: z.string(),
      zipcode: z.string(),
      city: z.string(),
      uf: z.string()
    }),
    items: z.array(
      z.object({
        name: z.string(),
        variation: z.string().optional().nullable(),
        source_reference: z.union([z.string(), z.number()]).optional().nullable(),
        quantity: z.number(),
        price: z.number()
      })
    )
  })
})

/**
 * POST /:companyId/adoorei
 * Recebe webhook da Adoorei, valida e cria um Lead atrelado à companyId
 */
router.post(
  '/:companyId/adoorei',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.params

      // 1) verifica se a company existe
      const company = await prisma.company.findUnique({ where: { id: companyId } })
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      // 2) valida payload
      const parseResult = adooreiPayloadSchema.safeParse(req.body)
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Payload inválido',
          details: parseResult.error.errors
        })
      }
      const { resource } = parseResult.data

      // 3) monta o payload para o serviço
      const payload: NewLeadPayload = {
        companyId,
        orderNumber:       resource.number,
        valueTotal:        resource.value_total,
        valueProducts:     resource.value_products,
        valueShipment:     resource.value_shipment,
        valueDiscount:     resource.value_discount,
        daysDelivery:      resource.days_delivery,
        estimatedDelivery: resource.created_at,
        gateway:           resource.gateway,
        paymentMethod:     resource.payment_method,
        billetBarcode:     resource.billet_barcode ?? null,
        gatewayTxId:       resource.gateway_transaction_id ?? null,
        customerFirstName: resource.customer.first_name,
        customerLastName:  resource.customer.last_name,
        customerDoc:       resource.customer.doc,
        customerEmail:     resource.customer.email,
        customerPhone:     resource.customer.phone,
        addressStreet:     resource.address.street,
        addressNumber:     resource.address.number,
        addressNeighborhood: resource.address.neighborhood,
        addressReceiver:   resource.address.receiver,
        addressZipcode:    resource.address.zipcode,
        addressCity:       resource.address.city,
        addressUf:         resource.address.uf,
        items: resource.items.map(i => ({
          name:            i.name,
          variation:       i.variation ?? null,
          sourceReference: i.source_reference?.toString() ?? null,
          quantity:        i.quantity,
          price:           i.price
        }))
      }

      // 4) cria o lead
      const lead = await createLead(payload)

      return res.status(201).json({
        success: true,
        trackingCode: lead.trackingCode
      })
    } catch (err: any) {
      return res.status(500).json({
        error: 'Erro interno ao processar webhook',
        message: err.message
      })
    }
  }
)

export default router
