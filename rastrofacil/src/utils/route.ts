import prisma from '../prisma'

/**
 * Mapeia os dois primeiros dígitos do CEP para o estado (UF).
 * Ajuste os ranges conforme sua necessidade real.
 */
const cepStateMap: { [prefix: string]: string } = {
  // SP: CEPs 01xxx-000 a 09xxx-999
  '01': 'SP', '02': 'SP', '03': 'SP', '04': 'SP',
  '05': 'SP', '06': 'SP', '07': 'SP', '08': 'SP', '09': 'SP',
  // RJ: 20xxx-000 a 22xxx-999
  '20': 'RJ', '21': 'RJ', '22': 'RJ',
  // MG: 30xxx-000 a 38xxx-999
  '30': 'MG', '31': 'MG', '32': 'MG', '33': 'MG',
  '34': 'MG', '35': 'MG', '36': 'MG', '37': 'MG', '38': 'MG',
  // BA: 40xxx-000 a 48xxx-999
  '40': 'BA', '41': 'BA', '42': 'BA', '43': 'BA',
  '44': 'BA', '45': 'BA', '46': 'BA', '47': 'BA', '48': 'BA',
  // PI: 64xxx-000 a 64xxx-999 (CEP do Piauí começa com “64”)
  '64': 'PI',
  // AC: 69xxx-000
  '69': 'AC',
  // AM: 69xxx-— (mesma faixa CEP acima, mas distinga por subnet se quiser)
  '69': 'AM',
  // PA: 66xxx-000 a 68xxx-999
  '66': 'PA', '67': 'PA', '68': 'PA',
  // ... adicione outros estados conforme necessário
}

/**
 * Mapeia UF para o hub principal daquela unidade federativa.
 * Certifique-se de ter seedado um hub com esses códigos.
 */
const stateMainHub: { [uf: string]: string } = {
  SP: 'SP01',
  RJ: 'RJ01',
  MG: 'MG01',
  BA: 'BA01',
  PI: 'PI01',
  AC: 'AC01',
  AM: 'AM01',
  PA: 'PA01',
  PR: 'PR01',
  RS: 'RS01',
  SC: 'SC01',
  RN: 'RN01',
  CE: 'CE01',
  PE: 'PE01',
  // mais, se precisar…
}

/**
 * Dado um CEP, retorna o código do hub principal daquele estado.
 */
export function hubForCep(cep: string): string {
  const prefix = cep.replace(/\D/g, '').substring(0, 2)
  const uf = cepStateMap[prefix]
  if (!uf) throw new Error(`Não foi possível mapear CEP ${cep} para um UF`)
  const hub = stateMainHub[uf]
  if (!hub) throw new Error(`Não há hub configurado para o UF ${uf}`)
  return hub
}

/**
 * Carrega do banco todas as conexões e monta um Map de adjacência:
 *   { fromCode: [ { to, weight }, ... ], ... }
 */
async function loadGraph() {
  const conns = await prisma.hubConnection.findMany()
  const graph = new Map<string, { to: string; weight: number }[]>()
  for (const { fromCode, toCode, distance } of conns) {
    if (!graph.has(fromCode)) graph.set(fromCode, [])
    graph.get(fromCode)!.push({ to: toCode, weight: distance })
  }
  return graph
}

/**
 * Dijkstra para achar o caminho de menor distância entre dois hubs.
 * Recebe CEPs, mapeia para hubs via hubForCep, então roda Dijkstra.
 */
export async function generateHubPath(
  originCep: string,
  destCep: string
): Promise<string[]> {
  const originHub = hubForCep(originCep)
  const destHub   = hubForCep(destCep)
  const graph     = await loadGraph()

  const dist    = new Map<string, number>()
  const prev    = new Map<string, string | null>()
  const visited = new Set<string>()

  // Inicializa distâncias
  for (const code of graph.keys()) {
    dist.set(code, Infinity)
    prev.set(code, null)
  }
  dist.set(originHub, 0)

  while (true) {
    // Escolhe o nó não visitado de menor distância
    let u: string | null = null
    for (const [code, d] of dist) {
      if (!visited.has(code) && (u === null || d < (dist.get(u) ?? Infinity))) {
        u = code
      }
    }
    if (u === null || u === destHub) break
    visited.add(u)

    // Relaxa arestas
    for (const edge of graph.get(u) ?? []) {
      if (visited.has(edge.to)) continue
      const alt = (dist.get(u) ?? Infinity) + edge.weight
      if (alt < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, alt)
        prev.set(edge.to, u)
      }
    }
  }

  // Reconstrói o caminho invertido
  const path: string[] = []
  let step: string | null = destHub
  while (step) {
    path.unshift(step)
    step = prev.get(step) ?? null
  }

  // Se não conectar, fallback direto
  if (path[0] !== originHub) {
    return [originHub, destHub]
  }
  return path
}

/**
 * Distribui o SLA (em horas) uniformemente ao longo das paradas.
 */
export function buildSchedule(
  pathCodes: string[],
  slaHours: number
): { label: string; eta: Date }[] {
  if (!Array.isArray(pathCodes) || pathCodes.length < 2) {
    throw new Error('pathCodes inválido: precisa ter ao menos origem e destino')
  }
  const now = new Date()
  const step = slaHours / (pathCodes.length - 1)
  return pathCodes.map((code, idx) => ({
    label: code,
    eta:   new Date(now.getTime() + idx * step * 3600 * 1000),
  }))
}
