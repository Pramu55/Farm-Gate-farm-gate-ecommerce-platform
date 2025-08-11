import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
const logger = pino({ name: 'geo-service' });
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
// In-memory demo store. Replace with DB.
const locations = new Map();
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.post('/location', (req, res) => {
    const { id, role, lat, lon, label } = req.body;
    if (!id || !role || typeof lat !== 'number' || typeof lon !== 'number') {
        return res.status(400).json({ error: 'id, role, lat, lon required' });
    }
    locations.set(id, { role, lat, lon, label });
    res.json({ ok: true });
});
app.get('/nearby', (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const radiusKm = Number(req.query.radiusKm ?? 25);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return res.status(400).json({ error: 'lat and lon are required' });
    }
    const R = 6371;
    const results = Array.from(locations.entries()).map(([id, loc]) => {
        const dLat = (loc.lat - lat) * Math.PI / 180;
        const dLon = (loc.lon - lon) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(loc.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;
        return { id, ...loc, distanceKm };
    }).filter(x => x.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    res.json({ results });
});
const PORT = Number(process.env.PORT) || 4004;
app.listen(PORT, () => {
    logger.info(`geo-service listening on :${PORT}`);
});
