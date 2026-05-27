const {
  MAIL_TO, MAIL_FROM,
  buildHtml, isValidEmail, isValidPhone,
  createTransporter, handleCors, parseMultipart
} = require('./shared');

const HONEYPOT = 'website';

// Deploy each export as its own Cloud Function:
//   gcloud functions deploy contact --entry-point contact --source functions/ ...
//   gcloud functions deploy careers --entry-point careers --source functions/ ...
//   gcloud functions deploy admissions --entry-point admissions --source functions/ ...

exports.contact = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { fields } = await parseMultipart(req);
  if (fields[HONEYPOT]) return res.status(400).json({ error: 'Spam detected.' });

  const { name, email, phone, subject, message } = fields;
  if (!name?.trim())                                   return res.status(400).json({ error: 'Name is required.' });
  if (!isValidEmail(email?.trim()))                    return res.status(400).json({ error: 'A valid email is required.' });
  if (phone?.trim() && !isValidPhone(phone.trim()))    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  if (!subject?.trim())                                return res.status(400).json({ error: 'Subject is required.' });
  if (!message?.trim())                                return res.status(400).json({ error: 'Message is required.' });

  try {
    await createTransporter().sendMail({
      from: MAIL_FROM, to: MAIL_TO, replyTo: email,
      subject: `Contact: ${subject}`,
      html: buildHtml('New Contact Message', { name, email, phone, subject, message })
    });
    res.json({ success: true });
  } catch (err) {
    console.error('contact:', err);
    res.status(500).json({ error: 'Unable to send message. Please try again.' });
  }
};

exports.careers = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { fields, files } = await parseMultipart(req);
  if (fields[HONEYPOT]) return res.status(400).json({ error: 'Spam detected.' });

  const { firstName, lastName, email, phone, preferredLocation, position, availability, coverLetter } = fields;
  if (!firstName?.trim())          return res.status(400).json({ error: 'First name is required.' });
  if (!lastName?.trim())           return res.status(400).json({ error: 'Last name is required.' });
  if (!isValidEmail(email?.trim())) return res.status(400).json({ error: 'A valid email is required.' });
  if (!phone?.trim())              return res.status(400).json({ error: 'Phone number is required.' });
  if (!isValidPhone(phone.trim())) return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  if (!preferredLocation?.trim())  return res.status(400).json({ error: 'Preferred location is required.' });
  if (!position?.trim())           return res.status(400).json({ error: 'Position of interest is required.' });

  const r = files.resume;
  const attachments = r?.buffer ? [{ filename: r.filename, content: r.buffer }] : [];

  try {
    await createTransporter().sendMail({
      from: MAIL_FROM, to: MAIL_TO, replyTo: email,
      subject: `Careers Application: ${position} — ${firstName} ${lastName}`,
      html: buildHtml('New Career Application', { firstName, lastName, email, phone, preferredLocation, position, availability, coverLetter }),
      attachments
    });
    res.json({ success: true });
  } catch (err) {
    console.error('careers:', err);
    res.status(500).json({ error: 'Unable to submit application. Please try again.' });
  }
};

exports.admissions = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { fields, files } = await parseMultipart(req);
  if (fields[HONEYPOT]) return res.status(400).json({ error: 'Spam detected.' });

  const {
    parentFirstName, parentLastName, email, phone, address,
    childFirstName, childLastName, childDob, childAge, program,
    location, schedule, startDate, allergies, comments,
    additionalChildren: additionalChildrenRaw
  } = fields;

  if (!parentFirstName?.trim()) return res.status(400).json({ error: 'Parent first name is required.' });
  if (!parentLastName?.trim())  return res.status(400).json({ error: 'Parent last name is required.' });
  if (!isValidEmail(email?.trim())) return res.status(400).json({ error: 'A valid email is required.' });
  if (!phone?.trim())           return res.status(400).json({ error: 'Phone number is required.' });
  if (!isValidPhone(phone.trim())) return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  if (!childFirstName?.trim())  return res.status(400).json({ error: "Child's first name is required." });
  if (!childLastName?.trim())   return res.status(400).json({ error: "Child's last name is required." });
  if (!program?.trim())         return res.status(400).json({ error: 'Program selection is required.' });
  if (!location?.trim())        return res.status(400).json({ error: 'Preferred location is required.' });
  if (!schedule?.trim())        return res.status(400).json({ error: 'Schedule type is required.' });

  let additionalChildren = [];
  if (additionalChildrenRaw?.trim()) {
    try { additionalChildren = JSON.parse(additionalChildrenRaw); } catch { /* ignore malformed */ }
  }

  const f = files.stateForm;
  const attachments = f?.buffer ? [{ filename: f.filename, content: f.buffer }] : [];

  const emailFields = {
    parentFirstName, parentLastName, email, phone, address,
    childFirstName, childLastName, childDob, childAge, program,
    location, schedule, startDate, allergies, comments,
  };
  additionalChildren.forEach((child, i) => {
    const n = i + 2;
    emailFields[`child${n}FirstName`] = child.firstName;
    emailFields[`child${n}LastName`] = child.lastName;
    if (child.dob)     emailFields[`child${n}Dob`]     = child.dob;
    if (child.age)     emailFields[`child${n}Age`]     = child.age;
    if (child.program) emailFields[`child${n}Program`] = child.program;
  });
  if (f) emailFields.stateForm = f.filename;

  const childNames = [`${childFirstName} ${childLastName}`, ...additionalChildren.map(c => `${c.firstName} ${c.lastName}`)].join(', ');

  try {
    await createTransporter().sendMail({
      from: MAIL_FROM, to: MAIL_TO, replyTo: email,
      subject: `Enrollment Application: ${childNames}`,
      html: buildHtml('New Enrollment Application', emailFields),
      attachments
    });
    res.json({ success: true });
  } catch (err) {
    console.error('admissions:', err);
    res.status(500).json({ error: 'Unable to submit application. Please try again.' });
  }
};
