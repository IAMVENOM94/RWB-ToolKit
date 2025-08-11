// api/admin/set-active.js
import { pool, initDb } from '../../lib/db.js';
import { withCors } from '../../lib/cors.js';

export default withCors(async function handler(req, res) {
  try {
    await initDb();
    if (req.method !== 'POST') {
      return res.status(405).json({ ok:false, error:'method_not_allowed' });
    }

    let { key, isActive } = req.body || {};

    // Нормализуем любое значение в boolean:
    if (typeof isActive !== 'boolean') {
      if (typeof isActive === 'string') {
        const s = isActive.trim().toLowerCase();
        if (s === 'true' || s === '1') isActive = true;
        else if (s === 'false' || s === '0') isActive = false;
      } else if (typeof isActive === 'number') {
        isActive = isActive === 1;
      }
    }

    if (!key || typeof isActive !== 'boolean') {
      return res.status(400).json({ ok:false, error:'missing_params' });
    }

    const r = await pool.query('UPDATE licenses SET is_active=$1 WHERE key=$2', [isActive, key]);
    if (!r.rowCount) return res.status(404).json({ ok:false, error:'not_found' });

    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(400).json({ ok:false, error:e.message });
  }
});
