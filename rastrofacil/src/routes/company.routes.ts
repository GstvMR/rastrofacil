// src/routes/company.routes.ts

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { requireAuth } from '../middlewares/requireAuth'

const router = Router()

// esquema de validação do body para criar/atualizar empresa + settings
const bodySchema = z.object({
  name:     z.string().min(1),
  prefix:   z.string().min(1).optional(),
  slaHours: z.number().int().positive().optional(),
  viewMode: z.enum(['simple','route']).optional(),
  theme: z.object({
    logo:               z.string(),
    fontFamily:         z.string(),
    colors: z.object({
      primary:          z.string(),
      accent:           z.string(),
      pending:          z.string(),
      background:       z.string(),
    }),
    showResumoDetalhado: z.boolean(),
  }).optional(),
})

// GET /companies
// lista todas as empresas do usuário autenticado
router.get(
  '/',
  requireAuth,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId || req.user?.sub
      if (!userId) return res.status(401).json({ error: 'Unauthorized' })

      const companies = await prisma.company.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          prefix: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      res.json(companies)
    } catch (err) {
      next(err)
    }
  }
)

// POST /companies
// cria uma nova empresa + suas configurações iniciais
router.post(
  '/',
  requireAuth,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { name, prefix, slaHours, viewMode, theme } = bodySchema.parse(req.body)
      const userId = req.userId || req.user?.sub
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

      // cria a empresa
      const company = await prisma.company.create({
        data: { name, prefix, userId },
      })

      // cria as configurações
      await prisma.companySettings.create({
        data: {
          companyId: company.id,
          ...(slaHours    !== undefined && { slaHours }),
          ...(viewMode    !== undefined && { viewMode }),
          // campos de tema
          ...(theme?.logo             && { logo:             theme.logo }),
          ...(theme?.fontFamily       && { fontFamily:       theme.fontFamily }),
          ...(theme?.colors.primary   && { themePrimary:     theme.colors.primary }),
          ...(theme?.colors.accent    && { themeAccent:      theme.colors.accent }),
          ...(theme?.colors.pending   && { themePending:     theme.colors.pending }),
          ...(theme?.colors.background&& { themeBackground:  theme.colors.background }),
          showResumoDetalhado: theme?.showResumoDetalhado ?? false,
        },
      })

      res.status(201).json(company)
    } catch (err) {
      next(err)
    }
  }
)

// GET /companies/:id/settings
// retorna apenas as configurações da empresa (incluindo cores, fonte, logo, flag de botão)
router.get(
  '/:id/settings',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.params.id
      const settings = await prisma.companySettings.findUnique({
        where: { companyId },
        select: {
          slaHours:           true,
          viewMode:           true,
          logo:               true,
          fontFamily:         true,
          themePrimary:       true,
          themeAccent:        true,
          themePending:       true,
          themeBackground:    true,
          showResumoDetalhado:true,
        },
      })

      if (!settings) {
        return res.status(404).json({ error: 'Configuração não encontrada' })
      }
      return res.json(settings)
    } catch (err) {
      next(err)
    }
  }
)

export default router
