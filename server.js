require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const nodemailer = require('nodemailer');
const path     = require('path');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

/* block sensitive files from being served */
app.get('/.env',        (_, res) => res.status(404).end());
app.get('/server.js',   (_, res) => res.status(404).end());
app.get('/package.json',(_, res) => res.status(404).end());
app.get('/package-lock.json',(_, res) => res.status(404).end());

/* serve the site */
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post('/enquiry', async (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name || !email || !phone) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }

  const html = `
<div style="font-family:monospace;background:#020208;color:#f2ece0;padding:32px;max-width:520px;border:1px solid #1e1e2e">
  <p style="color:#cc1414;letter-spacing:6px;font-size:18px;margin:0 0 4px">CONFIDENTIAL℗</p>
  <p style="color:#8a8090;letter-spacing:4px;font-size:11px;margin:0 0 24px">NEW CLEARANCE REQUEST — CASE-01</p>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="color:#8a8090;padding:8px 0;letter-spacing:3px;font-size:11px;width:200px">OPERATIVE</td>
        <td style="color:#f2ece0;padding:8px 0">${name}</td></tr>
    <tr><td style="color:#8a8090;padding:8px 0;letter-spacing:3px;font-size:11px">SECURE CHANNEL</td>
        <td style="color:#f2ece0;padding:8px 0">${email}</td></tr>
    <tr><td style="color:#8a8090;padding:8px 0;letter-spacing:3px;font-size:11px">CONTACT FREQUENCY</td>
        <td style="color:#f2ece0;padding:8px 0">+91 ${phone}</td></tr>
  </table>
  <p style="color:#cc1414;letter-spacing:3px;font-size:10px;margin:24px 0 0;border-top:1px solid #1e1e2e;padding-top:16px">
    TOP SECRET // INDIA OPS DIVISION
  </p>
</div>`;

  try {
    await transporter.sendMail({
      from: `"CONFIDENTIAL℗" <${process.env.GMAIL_USER}>`,
      to:   'amaychandra02@gmail.com',
      replyTo: email,
      subject: `[CONFIDENTIAL℗] Clearance Request — ${name}`,
      html,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[mail error]', err.message, err.code, err.responseCode);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`CONFIDENTIAL℗ backend → http://localhost:${PORT}`));
