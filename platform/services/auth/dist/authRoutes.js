import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const SALT_ROUNDS = 12;
export function createAuthRouter(pool) {
    const router = Router();
    router.post('/register', async (req, res) => {
        try {
            const { role, name, phone, address, state, district, company, license, pan, bank, password } = req.body;
            if (!role || !phone || !password) {
                return res.status(400).json({ error: 'role, phone, password required' });
            }
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            if (role === 'farmer') {
                const [result] = await pool.execute('INSERT INTO farmerregistration (farmer_name, farmer_phone, farmer_address, farmer_state, farmer_district, farmer_pan, farmer_bank, farmer_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name ?? '', phone, address ?? '', state ?? '', district ?? '', pan ?? '', bank ?? 0, passwordHash]);
                return res.status(201).json({ ok: true, role: 'farmer' });
            }
            if (role === 'buyer') {
                const [result] = await pool.execute('INSERT INTO buyerregistration (buyer_name, buyer_phone, buyer_addr, buyer_comp, buyer_license, buyer_bank, buyer_pan, buyer_mail, buyer_username, buyer_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name ?? '', phone, address ?? '', company ?? '', license ?? '', bank ?? 0, pan ?? '', '', String(phone), passwordHash]);
                return res.status(201).json({ ok: true, role: 'buyer' });
            }
            return res.status(400).json({ error: 'unknown role' });
        }
        catch (err) {
            if (err?.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'duplicate phone/username' });
            }
            return res.status(500).json({ error: 'register failed' });
        }
    });
    router.post('/login', async (req, res) => {
        try {
            const { role, phone, password } = req.body;
            if (!role || !phone || !password) {
                return res.status(400).json({ error: 'role, phone, password required' });
            }
            let row = null;
            if (role === 'farmer') {
                const [rows] = await pool.query('SELECT farmer_id as id, farmer_phone as phone, farmer_password as password FROM farmerregistration WHERE farmer_phone = ? LIMIT 1', [phone]);
                const list = rows;
                row = list[0] || null;
            }
            else if (role === 'buyer') {
                const [rows] = await pool.query('SELECT buyer_id as id, buyer_phone as phone, buyer_password as password FROM buyerregistration WHERE buyer_phone = ? LIMIT 1', [phone]);
                const list = rows;
                row = list[0] || null;
            }
            else {
                return res.status(400).json({ error: 'unknown role' });
            }
            if (!row) {
                return res.status(401).json({ error: 'invalid credentials' });
            }
            const stored = String(row.password || '');
            let valid = false;
            if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
                valid = await bcrypt.compare(password, stored);
            }
            else {
                // legacy fallback: compare plain or base64-encoded legacy value
                valid = stored === password || Buffer.from(password).toString('base64') === stored;
            }
            if (!valid) {
                return res.status(401).json({ error: 'invalid credentials' });
            }
            const token = jwt.sign({ sub: String(row.id), role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token });
        }
        catch (err) {
            return res.status(500).json({ error: 'login failed' });
        }
    });
    return router;
}
