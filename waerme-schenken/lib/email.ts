import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');
// Added verified sender domain
const FROM = 'hallo@waerme-schenken.ch';

// ── #1: Donation received (OTP + receipt) ──────────────────────────────────
export async function sendDonationReceivedEmail(to: string, userName: string, toyName: string) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Vielen Dank für deine Spende, ${userName}`,
        html: `
          <p>Hallo ${userName},</p>
          <p>Wir haben deine Spende <strong>${toyName}</strong> erhalten. Unser Team prüft sie in Kürze.</p>
          <p>Du kannst den Status jederzeit in deinem Portal verfolgen.</p>
          <p>Herzlich,<br/>Wärme schenken</p>
        `,
    });
}

// ── #2: Donation approved ──────────────────────────────────────────────────
export async function sendDonationApprovedEmail(to: string, userName: string, toyName: string) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Deine Spende ${toyName} ist nun freigeschaltet`,
        html: `
          <p>Hallo ${userName},</p>
          <p>Dein Spielzeug <strong>${toyName}</strong> ist jetzt im Shop sichtbar.</p>
          <p>Herzlich,<br/>Wärme schenken</p>
        `,
    });
}

// ── #3: Donation selected by a family ─────────────────────────────────────
export async function sendDonationSelectedEmail(
    to: string,
    userName: string,
    toyName: string,
    familyAddress: string
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Yay, dein Spielzeug ${toyName} wurde ausgesucht`,
        html: `
          <p>Hallo ${userName},</p>
          <p>Eine Familie hat dein Spielzeug <strong>${toyName}</strong> ausgewählt. Bitte sende es an:</p>
          <pre>${familyAddress}</pre>
          <p>Vergiss nicht, es als versendet zu markieren.</p>
          <p>Herzlich,<br/>Wärme schenken</p>
        `,
    });
}

// ── #4: Reminder ───────────────────────────────────────────────────────────
export async function sendDonationReminderEmail(to: string, userName: string, toyName: string) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Reminder: Dein Spielzeug ${toyName} wurde ausgesucht`,
        html: `
          <p>Hallo ${userName},</p>
          <p>Erinnerung: <strong>${toyName}</strong> wurde von einer Familie ausgewählt. Bitte vergiss nicht, es zu versenden.</p>
          <p>Herzlich,<br/>Wärme schenken</p>
        `,
    });
}

// ── OTP email ──────────────────────────────────────────────────────────────
export async function sendOtpEmail(to: string, code: string) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: 'Dein Einmalpasswort — Wärme schenken',
        html: `
          <p>Hallo,</p>
          <p>Dein Einmalpasswort lautet:</p>
          <h1 style="font-size:36px;letter-spacing:8px;font-family:monospace;">${code}</h1>
          <p>Es ist 10 Minuten gültig.</p>
          <p>Falls du keine Anmeldung angefordert hast, ignoriere diese E-Mail.</p>
          <p>Herzlich,<br/>Wärme schenken</p>
        `,
    });
}
