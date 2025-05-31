import 'dotenv-flow/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import creditsRoutes from './routes/credits.routes';
import leadRoutes from './routes/lead.routes';
import companyRoutes from './routes/company.routes';
import trackingRouter from './routes/tracking.routes';
import adooreiWebhook from './routes/webhook.adoorei.routes';

const app = express();

// 1) Segurança HTTP
app.use(helmet());

// 2) Parsers de body e cookies
app.use(express.json());
app.use(cookieParser());

// 3) CORS: só permite seu front e autoriza cookies
app.use(
  cors({
    origin: 'http://localhost:5173',  // substitua pela URL exata do seu front
    credentials: true,                // habilita envio/recebimento de cookies
  })
);

// 4) Health check
app.get('/health', (_req, res) => res.send('OK'));

// 5) Rotas da sua API
app.use('/auth', authRoutes);
app.use('/credits', creditsRoutes);
app.use('/leads', leadRoutes);
app.use('/companies', companyRoutes);
app.use('/', trackingRouter);
app.use('/', adooreiWebhook);

// 6) 404 e tratamento de erros
app.use((_req, _res, next) =>
  next({ status: 404, message: 'Not Found' })
);
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Server Error' });
});

// 7) Start
const port = Number(process.env.PORT) || 3000;
app.listen(port, () =>
  console.log(`API rodando em http://localhost:${port}`)
);

export default app;
