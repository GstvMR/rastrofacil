// src/utils/notification.ts
import { Resend } from 'resend'
import prisma from '../prisma'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendEmailUpdate(
  leadId: string,
  label: string,
  status: 'in_transit' | 'delivered'
) {
  // 1. Busque o lead e o e-mail do usuário
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      company: { include: { user: true } }
    }
  })
  const to = lead?.company?.user.email
  if (!to) throw new Error('Lead or user not found')

  // 2. Envie o e-mail
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to,
    subject: `Atualização de Rota: ${status}`,
    html: `
      <p>Seu pedido <strong>${leadId}</strong> ${
      status === 'delivered'
        ? 'foi entregue'
        : 'está em trânsito'
    } no hub <strong>${label}</strong>.</p>
    `
  })

  if (error) {
    console.error('Resend error:', error)
    throw new Error('Failed to send notification email')
  }

  console.log('Email enviado:', data.id)
}
