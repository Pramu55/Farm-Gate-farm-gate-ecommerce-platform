import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { createMysqlPool } from './db';
import { createAuthRouter } from './authRoutes';
const logger = pino({ name: 'auth-service' });
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
const pool = createMysqlPool();
app.use('/auth', createAuthRouter(pool));
app.use((err, req, res, next) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal Server Error' });
});
const PORT = Number(process.env.PORT) || 4001;
app.listen(PORT, () => {
    logger.info(`auth-service listening on :${PORT}`);
});
