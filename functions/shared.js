const nodemailer = require('nodemailer');
const Busboy = require('busboy');

const MAIL_TO = process.env.MAIL_TO || 'info@fairfieldec.org';
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER;

const FIELD_LABELS = {
  name: 'Name', email: 'Email', phone: 'Phone', subject: 'Subject', message: 'Message',
  firstName: 'First Name', lastName: 'Last Name', preferredLocation: 'Preferred Location',
  position: 'Position of Interest', availability: 'Availability',
  coverLetter: 'Cover Letter / Message', resume: 'Resume (attached)',
  parentFirstName: 'Parent First Name', parentLastName: 'Parent Last Name', address: 'Address',
  childFirstName: 'Child First Name', childLastName: 'Child Last Name',
  childDob: 'Child Date of Birth', childAge: 'Child Age', program: 'Program',
  location: 'Preferred Location', schedule: 'Schedule Type', startDate: 'Desired Start Date',
  allergies: 'Allergies / Special Needs', comments: 'Additional Comments',
  stateForm: 'State Form (attached)'
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function label(field) {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  // Handle child2FirstName → "Child 2 First Name", child3Dob → "Child 3 Date of Birth"
  const m = field.match(/^child(\d+)(\w+)$/);
  if (m) {
    const baseLabel = FIELD_LABELS[`child${m[2]}`] || m[2].replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    const clean = baseLabel.startsWith('Child ') ? baseLabel.slice(6) : baseLabel;
    return `Child ${m[1]} ${clean}`;
  }
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function buildHtml(title, fields) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:bold;white-space:nowrap;color:#555">${escapeHtml(label(k))}</td><td style="padding:6px 12px">${escapeHtml(v)}</td></tr>`)
    .join('');
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="background:#6BBE44;color:#fff;padding:16px 20px;margin:0;border-radius:6px 6px 0 0">${escapeHtml(title)}</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;border-top:none">${rows}</table>
      <p style="margin-top:16px;color:#999;font-size:12px">Sent from the Fairfield Education Center website</p>
    </div>`;
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length === 10 && !/^(\d)\1{9}$/.test(d);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

// Returns true if the request was an OPTIONS preflight (already handled).
// Rejects requests from origins not in ALLOWED_ORIGIN (comma-separated list supported).
function handleCors(req, res) {
  const allowedRaw = process.env.ALLOWED_ORIGIN || '';
  const allowed = allowedRaw.split(',').map(o => o.trim()).filter(Boolean);
  const origin = req.headers.origin || '';

  // Block if origin not in the allowed list
  if (allowed.length && !allowed.includes(origin)) {
    res.status(403).json({ error: 'Forbidden' });
    return true;
  }

  res.set('Access-Control-Allow-Origin', origin || allowed[0] || '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};
    const bb = Busboy({ headers: req.headers });
    bb.on('field', (name, val) => { fields[name] = val; });
    bb.on('file', (name, stream, info) => {
      const chunks = [];
      stream.on('data', c => chunks.push(c));
      stream.on('end', () => {
        files[name] = { buffer: Buffer.concat(chunks), filename: info.filename, mimetype: info.mimeType };
      });
    });
    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error', reject);
    // GCF Gen 1 exposes rawBody; Gen 2 / local dev uses a readable stream.
    if (req.rawBody) { bb.end(req.rawBody); } else { req.pipe(bb); }
  });
}

module.exports = {
  MAIL_TO, MAIL_FROM,
  buildHtml, isValidEmail, isValidPhone,
  createTransporter, handleCors, parseMultipart
};
