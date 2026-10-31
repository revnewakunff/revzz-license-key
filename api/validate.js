const DB_URL = "https://revzz-license-key-default-rtdb.firebaseio.com/keys";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { key, deviceId } = req.query;
  if (!key || !deviceId) return res.status(400).json({ valid: false, reason: "Missing key/deviceId" });
  try {
    const r = await fetch(`${DB_URL}/${key}.json`);
    const data = await r.json();
    if (!data) return res.json({ valid: false, reason: "Key not found" });
    const now = Date.now();
    const dur = data.durationDay || parseInt(data.duration) || 1;
    const expire = (data.created || 0) + (dur * 24*60*60*1000);
    if (data.created && now > expire) {
      return res.json({ valid: false, reason: "EXPIRED", expiredAt: expire });
    }
    const max = data.max || 1;
    const used = data.devicesUsed || 0;
    const devices = data.deviceList || data.devices || [];
    if (devices.includes(deviceId) || data.deviceId === deviceId) {
      return res.json({ valid: true, expireAt: expire });
    }
    if (used >= max) return res.json({ valid: false, reason: "MAX DEVICE REACHED" });
    data.devicesUsed = used + 1;
    data.deviceList = [...devices, deviceId];
    await fetch(`${DB_URL}/${key}.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return res.json({ valid: true, expireAt: expire });
  } catch (e) { return res.status(500).json({ valid: false, reason: e.message }); }
}
