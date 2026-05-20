const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const mailTo = process.env.MAIL_TO || 'fairfieldeducationcenters@gmail.com';
const mailFrom = process.env.SMTP_USER || 'no-reply@localhost';
const HONEYPOT_FIELD = 'website';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const FIELD_LABELS = {
  // Contact
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  subject: 'Subject',
  message: 'Message',
  // Careers
  firstName: 'First Name',
  lastName: 'Last Name',
  preferredLocation: 'Preferred Location',
  position: 'Position of Interest',
  availability: 'Availability',
  coverLetter: 'Cover Letter / Message',
  resume: 'Resume (attached)',
  // Admissions — parent
  parentFirstName: 'Parent First Name',
  parentLastName: 'Parent Last Name',
  address: 'Address',
  // Admissions — child
  childFirstName: 'Child First Name',
  childLastName: 'Child Last Name',
  childDob: 'Child Date of Birth',
  childAge: 'Child Age',
  program: 'Program',
  // Admissions — preferences
  location: 'Preferred Location',
  schedule: 'Schedule Type',
  startDate: 'Desired Start Date',
  allergies: 'Allergies / Special Needs',
  comments: 'Additional Comments'
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function label(field) {
  return FIELD_LABELS[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function buildHtml(title, fields) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:bold;white-space:nowrap;color:#555">${escapeHtml(label(k))}</td><td style="padding:6px 12px">${escapeHtml(v)}</td></tr>`)
    .join('');
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="background:#6BBE44;color:#fff;padding:16px 20px;margin:0;border-radius:6px 6px 0 0">${escapeHtml(title)}</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;border-top:none">
        ${rows}
      </table>
      <p style="margin-top:16px;color:#999;font-size:12px">Sent from the Fairfield Education Center website</p>
    </div>`;
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length !== 10) return false;
  if (/^(\d)\1{9}$/.test(digits)) return false;
  return true;
}

// ── Contact ────────────────────────────────────────────────────────────────
app.post('/api/contact', upload.none(), async (req, res) => {
  if (req.body[HONEYPOT_FIELD]) return res.status(400).json({ error: 'Spam detected.' });

  const { name, email, phone, subject, message } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!isValidEmail(email?.trim())) return res.status(400).json({ error: 'A valid email is required.' });
  if (phone?.trim() && !isValidPhone(phone.trim())) return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  if (!subject?.trim()) return res.status(400).json({ error: 'Subject is required.' });
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

  try {
    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: email,
      subject: `Contact: ${subject}`,
      html: buildHtml('New Contact Message', { name, email, phone, subject, message })
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ error: 'Unable to send message. Please try again.' });
  }
});

// ── Careers ────────────────────────────────────────────────────────────────
app.post('/api/careers', upload.single('resume'), async (req, res) => {
  if (req.body[HONEYPOT_FIELD]) return res.status(400).json({ error: 'Spam detected.' });

  const { firstName, lastName, email, phone, preferredLocation, position, availability, coverLetter } = req.body;
  if (!firstName?.trim()) return res.status(400).json({ error: 'First name is required.' });
  if (!lastName?.trim()) return res.status(400).json({ error: 'Last name is required.' });
  if (!isValidEmail(email?.trim())) return res.status(400).json({ error: 'A valid email is required.' });
  if (!phone?.trim()) return res.status(400).json({ error: 'Phone number is required.' });
  if (phone?.trim() && !isValidPhone(phone.trim())) return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  if (!preferredLocation?.trim()) return res.status(400).json({ error: 'Preferred location is required.' });
  if (!position?.trim()) return res.status(400).json({ error: 'Position of interest is required.' });

  const attachments = [];
  if (req.file?.buffer) {
    attachments.push({ filename: req.file.originalname, content: req.file.buffer });
  }

  try {
    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: email,
      subject: `Careers Application: ${position} — ${firstName} ${lastName}`,
      html: buildHtml('New Career Application', { firstName, lastName, email, phone, preferredLocation, position, availability, coverLetter }),
      attachments
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Careers email error:', err);
    res.status(500).json({ error: 'Unable to submit application. Please try again.' });
  }
});

// ── Admissions ─────────────────────────────────────────────────────────────
app.post('/api/admissions', upload.single('stateForm'), async (req, res) => {
  if (req.body[HONEYPOT_FIELD]) return res.status(400).json({ error: 'Spam detected.' });

  const {
    parentFirstName, parentLastName, email, phone, address,
    childFirstName, childLastName, childDob, childAge, program,
    location, schedule, startDate, allergies, comments
  } = req.body;

  if (!parentFirstName?.trim()) return res.status(400).json({ error: 'Parent first name is required.' });
  if (!parentLastName?.trim()) return res.status(400).json({ error: 'Parent last name is required.' });
  if (!isValidEmail(email?.trim())) return res.status(400).json({ error: 'A valid email is required.' });
  if (!phone?.trim()) return res.status(400).json({ error: 'Phone number is required.' });
  if (phone?.trim() && !isValidPhone(phone.trim())) return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  if (!childFirstName?.trim()) return res.status(400).json({ error: "Child's first name is required." });
  if (!childLastName?.trim()) return res.status(400).json({ error: "Child's last name is required." });
  if (!program?.trim()) return res.status(400).json({ error: 'Program selection is required.' });
  if (!location?.trim()) return res.status(400).json({ error: 'Preferred location is required.' });
  if (!schedule?.trim()) return res.status(400).json({ error: 'Schedule type is required.' });

  const attachments = [];
  if (req.file?.buffer) {
    attachments.push({ filename: req.file.originalname, content: req.file.buffer });
  }

  try {
    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: email,
      subject: `Enrollment Application: ${childFirstName} ${childLastName}`,
      html: buildHtml('New Enrollment Application', {
        parentFirstName, parentLastName, email, phone, address,
        childFirstName, childLastName, childDob, childAge, program,
        location, schedule, startDate, allergies, comments,
        ...(req.file ? { stateForm: req.file.originalname } : {})
      }),
      attachments
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Admissions email error:', err);
    res.status(500).json({ error: 'Unable to submit application. Please try again.' });
  }
});

app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
