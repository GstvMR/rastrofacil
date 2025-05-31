import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de hubs e conexões…')

  // 1. Seed de hubs
  const hubs = [
    // SP (4)
    { code: 'SP01', name: 'São Paulo – Centro',        lat: -23.55052, lng: -46.633308 },
    { code: 'SP02', name: 'Campinas',                   lat: -22.90556, lng: -47.06083  },
    { code: 'SP03', name: 'Sorocaba',                   lat: -23.50154, lng: -47.45262  },
    { code: 'SP04', name: 'São José dos Campos',        lat: -23.18907, lng: -45.88417  },
    // MG (3)
    { code: 'MG01', name: 'Belo Horizonte',             lat: -19.9245,  lng: -43.9352   },
    { code: 'MG02', name: 'Uberlândia',                 lat: -18.9122,  lng: -48.2754   },
    { code: 'MG03', name: 'Juiz de Fora',               lat: -21.7642,  lng: -43.3509   },
    // RJ (2)
    { code: 'RJ01', name: 'Rio de Janeiro',             lat: -22.9068,  lng: -43.1729   },
    { code: 'RJ02', name: 'Niterói',                    lat: -22.8832,  lng: -43.1034   },
    // ES (1)
    { code: 'ES01', name: 'Vitória',                    lat: -20.3155,  lng: -40.3128   },
    // BA (3)
    { code: 'BA01', name: 'Salvador',                   lat: -12.9777,  lng: -38.5016   },
    { code: 'BA02', name: 'Feira de Santana',           lat: -12.2664,  lng: -38.9663   },
    { code: 'BA03', name: 'Vitória da Conquista',       lat: -14.8467,  lng: -40.8396   },
    // PI (2)
    { code: 'PI01', name: 'Teresina',                   lat: -5.09194,  lng: -42.8034   },
    { code: 'PI02', name: 'Picos',                      lat: -7.0779,   lng: -41.4672   },
    // AC, AM, PA
    { code: 'AC01', name: 'Rio Branco',                 lat: -9.9754,   lng: -67.8243   },
    { code: 'AM01', name: 'Manaus',                     lat: -3.11903,  lng: -60.02173  },
    { code: 'PA01', name: 'Belém',                      lat: -1.45502,  lng: -48.50236  },
    // outras capitais para cobertura mínima
    { code: 'PR01', name: 'Curitiba',                   lat: -25.4284,  lng: -49.2733   },
    { code: 'RS01', name: 'Porto Alegre',               lat: -30.0346,  lng: -51.2177   },
    { code: 'SC01', name: 'Florianópolis',              lat: -27.5945,  lng: -48.5480   },
    { code: 'RN01', name: 'Natal',                      lat: -5.7945,   lng: -35.2110   },
    { code: 'CE01', name: 'Fortaleza',                  lat: -3.7172,   lng: -38.5434   },
    { code: 'PE01', name: 'Recife',                     lat: -8.0543,   lng: -34.8813   }
  ]

  for (const hub of hubs) {
    await prisma.hub.upsert({
      where: { code: hub.code },
      update: {},
      create: hub,
    })
  }
  console.log(`✅ Seed de ${hubs.length} hubs concluída.`)

  // 2. Seed de conexões bidirecionais
  const connections = const connections = [
    // SP ↔ MG
    { fromCode: 'SP01', toCode: 'MG01', distance: 587 },
    { fromCode: 'MG01', toCode: 'SP01', distance: 587 },
  
    // SP ↔ RJ
    { fromCode: 'SP01', toCode: 'RJ01', distance: 429 },
    { fromCode: 'RJ01', toCode: 'SP01', distance: 429 },
  
    // SP ↔ PR
    { fromCode: 'SP02', toCode: 'PR01', distance: 355 },
    { fromCode: 'PR01', toCode: 'SP02', distance: 355 },
  
    // SP ↔ ES
    { fromCode: 'SP03', toCode: 'ES01', distance: 791 },
    { fromCode: 'ES01', toCode: 'SP03', distance: 791 },
  
    // MG ↔ BA
    { fromCode: 'MG01', toCode: 'BA01', distance: 1160 },
    { fromCode: 'BA01', toCode: 'MG01', distance: 1160 },
  
    // MG ↔ ES
    { fromCode: 'MG02', toCode: 'ES01', distance: 840 },
    { fromCode: 'ES01', toCode: 'MG02', distance: 840 },
  
    // RJ ↔ ES
    { fromCode: 'RJ02', toCode: 'ES01', distance: 514 },
    { fromCode: 'ES01', toCode: 'RJ02', distance: 514 },
  
    // ES ↔ BA
    { fromCode: 'ES01', toCode: 'BA03', distance: 1200 },
    { fromCode: 'BA03', toCode: 'ES01', distance: 1200 },
  
    // BA ↔ PE
    { fromCode: 'BA01', toCode: 'PE01', distance: 2173 },
    { fromCode: 'PE01', toCode: 'BA01', distance: 2173 },
  
    // BA ↔ SE
    { fromCode: 'BA02', toCode: 'SE01', distance: 548 },
    { fromCode: 'SE01', toCode: 'BA02', distance: 548 },
  
    // SE ↔ AL
    { fromCode: 'SE01', toCode: 'AL01', distance: 276 },
    { fromCode: 'AL01', toCode: 'SE01', distance: 276 },
  
    // AL ↔ PE
    { fromCode: 'AL01', toCode: 'PE01', distance: 535 },
    { fromCode: 'PE01', toCode: 'AL01', distance: 535 },
  
    // PE ↔ PB
    { fromCode: 'PE02', toCode: 'PB01', distance: 133 },
    { fromCode: 'PB01', toCode: 'PE02', distance: 133 },
  
    // PB ↔ RN
    { fromCode: 'PB01', toCode: 'RN01', distance: 380 },
    { fromCode: 'RN01', toCode: 'PB01', distance: 380 },
  
    // RN ↔ CE
    { fromCode: 'RN01', toCode: 'CE01', distance: 520 },
    { fromCode: 'CE01', toCode: 'RN01', distance: 520 },
  
    // CE ↔ PI
    { fromCode: 'CE02', toCode: 'PI02', distance: 670 },
    { fromCode: 'PI02', toCode: 'CE02', distance: 670 },
  
    // PI ↔ MA
    { fromCode: 'PI01', toCode: 'MA01', distance: 730 },
    { fromCode: 'MA01', toCode: 'PI01', distance: 730 },
  
    // MA ↔ PA
    { fromCode: 'MA01', toCode: 'PA01', distance: 1200 },
    { fromCode: 'PA01', toCode: 'MA01', distance: 1200 },
  
    // PA ↔ AP
    { fromCode: 'PA01', toCode: 'AP01', distance: 350 },
    { fromCode: 'AP01', toCode: 'PA01', distance: 350 },
  
    // PA ↔ AM
    { fromCode: 'PA01', toCode: 'AM01', distance: 2660 },
    { fromCode: 'AM01', toCode: 'PA01', distance: 2660 },
  
    // AM ↔ RR
    { fromCode: 'AM01', toCode: 'RR01', distance: 1100 },
    { fromCode: 'RR01', toCode: 'AM01', distance: 1100 },
  
    // AM ↔ RO
    { fromCode: 'AM01', toCode: 'RO01', distance: 1210 },
    { fromCode: 'RO01', toCode: 'AM01', distance: 1210 },
  
    // RO ↔ AC
    { fromCode: 'RO01', toCode: 'AC01', distance: 1800 },
    { fromCode: 'AC01', toCode: 'RO01', distance: 1800 },
  
    // AC ↔ AM
    { fromCode: 'AC01', toCode: 'AM01', distance: 3450 },
    { fromCode: 'AM01', toCode: 'AC01', distance: 3450 },
  
    // PR ↔ SC
    { fromCode: 'PR01', toCode: 'SC01', distance: 500 },
    { fromCode: 'SC01', toCode: 'PR01', distance: 500 },
  
    // SC ↔ RS
    { fromCode: 'SC01', toCode: 'RS01', distance: 800 },
    { fromCode: 'RS01', toCode: 'SC01', distance: 800 }
  ]
  

  await prisma.hubConnection.createMany({
    data: connections,
    skipDuplicates: true,
  })
  console.log(`✅ Seed de ${connections.length} conexões concluída.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
