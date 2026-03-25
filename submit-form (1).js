const { Resend } = require('resend');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { firstName, lastName, email, phone, service, datetime, notes } = data;

  // Basic validation
  if (!firstName || !email || !service) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  try {
    await resend.emails.send({
      from: 'Lumière Med Spa <onboarding@resend.dev>',
      to: 'silasabankwa6@gmail.com',
      replyTo: email,
      subject: `New Booking Request — ${service}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif;background:#faf9f4;padding:2rem">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
            <div style="background:#5b6400;padding:1.5rem 2rem">
              <h1 style="color:#fff;margin:0;font-size:1.2rem;letter-spacing:.05em">Lumière Med Spa</h1>
              <p style="color:rgba(255,255,255,.7);margin:.25rem 0 0;font-size:.85rem">New appointment request</p>
            </div>
            <div style="padding:2rem">
              <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;width:140px">Name</td>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19">${firstName} ${lastName || ''}</td>
                </tr>
                <tr>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Email</td>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19"><a href="mailto:${email}" style="color:#5b6400">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Phone</td>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19">${phone || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Service</td>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19;font-weight:600">${service}</td>
                </tr>
                <tr>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Preferred Time</td>
                  <td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19">${datetime || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:.75rem 0;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;vertical-align:top">Notes</td>
                  <td style="padding:.75rem 0;color:#1b1c19">${notes || '—'}</td>
                </tr>
              </table>
              <div style="margin-top:1.5rem;padding:1rem;background:#f5f4ef;border-radius:8px">
                <p style="margin:0;font-size:.8rem;color:#474834">
                  💡 Hit <strong>Reply</strong> to respond directly to ${firstName} at ${email}
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Resend error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};
