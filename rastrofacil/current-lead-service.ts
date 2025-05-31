// src/services/lead.service.ts
import prisma from '../prisma'
import { nanoid } from 'nanoid'
import type { Lead, LeadItem } from '@prisma/client'

export type NewLeadPayload = {
  companyId: string
  orderNumber: number
  valueTotal: number
  valueProducts: number
  valueShipment: number
  valueDiscount: number
  daysDelivery: string
  estimatedDelivery?: Date
  gateway: string
  paymentMethod: string
  billetBarcode?: string | null
  gatewayTxId?: string | null
  customerFirstName: string
  customerLastName: string
  customerDoc: string
  customerEmail: string
  customerPhone: string
  addressStreet: string
  addressNumber: string
  addressNeighborhood: string
  addressReceiver: string
  addressZipcode: string
  addressCity: string
  addressUf: string
  items: Array<{
    name: string
    variation?: string | null
    sourceReference?: string | null
    quantity: number
    price: number
  }>
}

export async function createLead(
  payload: NewLeadPayload
): Promise<Lead & { items: LeadItem[] }> {
  return prisma.$transaction(async (tx) => {
    // 1) Busca prefixo da empresa
    const company = await tx.company.findUnique({
      where: { id: payload.companyId },
      select: { prefix: true },
    })
    if (!company) throw new Error('Empresa não encontrada')

    // 2) Gerar trackingCode
    const trackingCode = `${company.prefix ?? ''}-${nanoid(8).toUpperCase()}`

    // 3) Criar lead + items
    const lead = await tx.lead.create({
      data: {
        companyId:          payload.companyId,
        trackingCode,
        status:             'purchase',
        orderNumber:        payload.orderNumber,
        valueTotal:         payload.valueTotal,
        valueProducts:      payload.valueProducts,
        valueShipment:      payload.valueShipment,
        valueDiscount:      payload.valueDiscount,
        daysDelivery:       payload.daysDelivery,
        estimatedDelivery:  payload.estimatedDelivery ?? null,
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
        items: {
          create: payload.items.map(i => ({
            name:            i.name,
            variation:       i.variation,
            sourceReference: i.sourceReference,
            quantity:        i.quantity,
            price:           i.price,
          }))
        }
      },
      include: { items: true }
    })

    // 4) Gravar histórico inicial
    await tx.leadStatusHistory.create({
      data: { leadId: lead.id, status: 'purchase' }
    })

    return lead
  })
}
