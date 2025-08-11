import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { fetch } from 'undici';

const logger = pino({ name: 'weather-service' });

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/forecast', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query as { lat?: string; lon?: string };
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required' });
    }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&hourly=temperature_2m,precipitation_probability`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    logger.error({ err }, 'forecast failed');
    res.status(500).json({ error: 'weather unavailable' });
  }
});

const PORT = Number(process.env.PORT) || 4003;
app.listen(PORT, () => {
  logger.info(`weather-service listening on :${PORT}`);
});