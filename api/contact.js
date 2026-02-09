const nodemailer = require('nodemailer');

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 4000;

function asText(value, maxLen) {
  const text = String(value || '').trim();
  return text.slice(0, maxLen);
}

function asEmail(value) {
  const email = asText(value, MAX_EMAIL);
  if (!email) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const naam = asText(body.naam, MAX_NAME);
    const email = asEmail(body.email);
    const vraag = asText(body.vraag, MAX_MESSAGE);
    const honey = asText(body.honey, 200);

    // Honeypot ingevuld: stil accepteren om bots te dempen.
    if (honey) {
      return res.status(200).json({ success: true });
    }

    if (!vraag) {
      return res.status(400).json({ success: false, message: 'Vul je vraag in.' });
    }

    const host = process.env.SMTP_HOST || 'smtp.ionos.com';
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';
    const to = process.env.CONTACT_TO || 'info@linszorgt.nl';
    const from = process.env.CONTACT_FROM || user;

    if (!user || !pass || !from) {
      return res.status(500).json({
        success: false,
        message: 'Mailserver is nog niet geconfigureerd (SMTP_USER/SMTP_PASS).'
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    const subject = 'Nieuwe vraag via linszorgt.nl';
    const lines = [
      'Nieuwe vraag via linszorgt.nl',
      '',
      `Naam: ${naam || '(niet ingevuld)'}`,
      `E-mail: ${email || '(niet ingevuld)'}`,
      '',
      'Vraag:',
      vraag
    ];

    await transporter.sendMail({
      from: `LinsZorgt formulier <${from}>`,
      to,
      replyTo: email || undefined,
      subject,
      text: lines.join('\n')
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Verzenden mislukt. Controleer SMTP-instellingen of mailboxrechten.'
    });
  }
};
