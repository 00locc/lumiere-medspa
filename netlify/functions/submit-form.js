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

  if (!firstName || !email || !service) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  try {
    await Promise.all([

      // EMAIL 1: Notify the spa owner
      resend.emails.send({
        from: 'Lumière Med Spa <onboarding@resend.dev>',
        to: 'silasabankwa6@gmail.com',
        replyTo: email,
        subject: `New Booking Request — ${service}`,
        html: `
          <!DOCTYPE html><html><body style="font-family:sans-serif;background:#faf9f4;padding:2rem;margin:0">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
            <div style="background:#5b6400;padding:1.5rem 2rem">
              <h1 style="color:#fff;margin:0;font-size:1.2rem;letter-spacing:.05em">Lumière Med Spa</h1>
              <p style="color:rgba(255,255,255,.7);margin:.25rem 0 0;font-size:.85rem">New appointment request received</p>
            </div>
            <div style="padding:2rem">
              <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
                <tr><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;width:140px">Name</td><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19">${firstName} ${lastName || ''}</td></tr>
                <tr><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Email</td><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19"><a href="mailto:${email}" style="color:#5b6400">${email}</a></td></tr>
                <tr><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Phone</td><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19">${phone || '—'}</td></tr>
                <tr><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Service</td><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19;font-weight:600">${service}</td></tr>
                <tr><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Preferred Time</td><td style="padding:.75rem 0;border-bottom:1px solid #efeee9;color:#1b1c19">${datetime || '—'}</td></tr>
                <tr><td style="padding:.75rem 0;color:#777962;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;vertical-align:top">Notes</td><td style="padding:.75rem 0;color:#1b1c19">${notes || '—'}</td></tr>
              </table>
              <div style="margin-top:1.5rem;padding:1rem;background:#f5f4ef;border-radius:8px">
                <p style="margin:0;font-size:.8rem;color:#474834">💡 Hit <strong>Reply</strong> to respond directly to ${firstName} at ${email}</p>
              </div>
            </div>
          </div></body></html>
        `,
      }),

      // EMAIL 2: Confirmation to the user
      resend.emails.send({
        from: 'Lumière Med Spa <onboarding@resend.dev>',
        to: email,
        subject: `We received your request, ${firstName} ✨`,
        html: `
          <!DOCTYPE html><html><body style="font-family:sans-serif;background:#faf9f4;padding:2rem;margin:0">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

            <div style="background:#5b6400;padding:2.5rem 2rem;text-align:center">
              <h1 style="color:#fff;margin:0;font-family:Georgia,serif;font-size:1.8rem;font-weight:400;letter-spacing:.05em">Lumi<em>ère</em></h1>
              <p style="color:rgba(255,255,255,.7);margin:.5rem 0 0;font-size:.85rem;letter-spacing:.1em;text-transform:uppercase">Med Spa</p>
            </div>

            <div style="padding:2.5rem 2rem;text-align:center">
              <div style="font-size:2rem;margin-bottom:1rem">✨</div>
              <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#1b1c19;font-weight:400;margin:0 0 1rem">Thank you, ${firstName}!</h2>
              <p style="color:#474834;font-size:.95rem;line-height:1.7;margin:0 0 1.5rem">
                We've received your consultation request for <strong style="color:#5b6400">${service}</strong> and will be in touch within 2 hours to confirm your appointment.
              </p>

              <div style="background:#f5f4ef;border-radius:8px;padding:1.5rem;text-align:left;margin-bottom:1.5rem">
                <p style="font-size:.65rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#777962;margin:0 0 1rem">Your Request Summary</p>
                <table cellpadding="0" cellspacing="0" style="width:100%">
                  <tr><td style="padding:.4rem 0;font-size:.82rem;color:#777962;width:120px">Service</td><td style="padding:.4rem 0;font-size:.82rem;color:#1b1c19;font-weight:600">${service}</td></tr>
                  <tr><td style="padding:.4rem 0;font-size:.82rem;color:#777962">Preferred time</td><td style="padding:.4rem 0;font-size:.82rem;color:#1b1c19">${datetime || 'Flexible'}</td></tr>
                  <tr><td style="padding:.4rem 0;font-size:.82rem;color:#777962">Phone</td><td style="padding:.4rem 0;font-size:.82rem;color:#1b1c19">${phone || '—'}</td></tr>
                </table>
              </div>

              <p style="color:#474834;font-size:.88rem;line-height:1.7;margin:0 0 2rem">
                If you have any questions feel free to reply to this email or call us at <strong>(310) 555-0198</strong>.
              </p>
              <p style="font-family:Georgia,serif;font-style:italic;font-size:1.1rem;color:#5b6400;margin:0">
                We look forward to seeing you soon.
              </p>
            </div>

            <div style="background:#f5f4ef;padding:1.2rem 2rem;text-align:center;border-top:1px solid #efeee9">
              <p style="margin:0;font-size:.72rem;color:#777962">Lumière Med Spa · 482 Lumière Way, Suite 100, Wellness District, CA 90210</p>
              <p style="margin:.25rem 0 0;font-size:.72rem;color:#777962">© 2025 Lumière Med Spa. All rights reserved.</p>
            </div>

          </div></body></html>
        `,
      }),

    ]);

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('Resend error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) };
  }
};
