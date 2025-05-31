import prisma from '../prisma'
import { createLead } from '../services/lead.service'

const INTERVAL_MS = 60_000  // roda a cada 1 minuto

async function processPending() {
  console.log('🔄 Verificando leads pendentes…')
  const pendings = await prisma.lead.findMany({
    where: { status: 'pending' },
    select: { id: true, companyId: true, originCep: true, destCep: true },
  })

  for (const lead of pendings) {
    try {
      // Reuso de createLead faz o débito e gera rota
      const settings = await prisma.companySettings.findUnique({
        where: { companyId: lead.companyId },
        select: { slaHours: true },
      })
      const slaHours = settings?.slaHours ?? 120

      await createLead(
        lead.companyId,
        lead.originCep,
        lead.destCep,
        slaHours
      )
      console.log(`✅ Lead ${lead.id} reprocessado`)
    } catch (err) {
      console.error(`❌ Falha ao reprocessar lead ${lead.id}:`, err)
    }
  }
}

console.log('🛠️ pendingLeadsWorker iniciado')
processPending()       // roda imediatamento
setInterval(processPending, INTERVAL_MS)