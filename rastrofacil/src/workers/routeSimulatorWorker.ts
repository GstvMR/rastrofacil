import prisma from '../prisma'
import { sendEmailUpdate } from '../utils/notification'  // veja nota abaixo

const INTERVAL_MS = 5 * 60_000  // roda a cada 5 minutos

async function simulateRoutes() {
  console.log('🚚 Simulando rotas em trânsito…')
  const routes = await prisma.route.findMany({
    where: { status: { in: ['planned', 'in_transit'] } },
    include: { stops: true },
  })

  const now = new Date()
  for (const route of routes) {
    const stops = route.stops.sort((a, b) => a.idx - b.idx)
    const nextIdx = route.currentIdx

    if (nextIdx >= stops.length) continue

    const stop = stops[nextIdx]
    if (stop.eta <= now) {
      // marque arrivedAt e departedAt
      await prisma.routeStop.update({
        where: { id: stop.id },
        data: { arrivedAt: now, departedAt: now, status: 'departed' },
      })

      // atualiza índice e status da rota
      const isLast = nextIdx + 1 === stops.length
      await prisma.route.update({
        where: { id: route.id },
        data: {
          currentIdx: nextIdx + 1,
          status: isLast ? 'delivered' : 'in_transit',
        },
      })

      // notifica o lead
      sendEmailUpdate(route.leadId, stop.label, isLast ? 'delivered' : 'in_transit')
      console.log(`🔔 Notificação enviada para lead ${route.leadId}: ${stop.label}`)
    }
  }
}

console.log('🛠️ routeSimulatorWorker iniciado')
simulateRoutes()       // roda imediatamente
setInterval(simulateRoutes, INTERVAL_MS)