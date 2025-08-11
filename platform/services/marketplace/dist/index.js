import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
const logger = pino({ name: 'marketplace-service' });
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.get('/listings', (req, res) => {
    res.json({ items: [] });
});
const PORT = Number(process.env.PORT) || 4002;
app.listen(PORT, () => {
    logger.info(`marketplace-service listening on :${PORT}`);
});
