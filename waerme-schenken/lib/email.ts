import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = 'hallo@waerme-schenken.ch';
const SIGNATURE = '<p>Liebe Grüsse<br/>Catharina, Gaby &amp; Vanessa</p>';

// ── #1: Donation received ──────────────────────────────────────────────────
export async function sendDonationReceivedEmail(
    to: string,
    userName: string,
    toyName: string,
    openingDate = 'dem Beginn der Spielzeugbörse'
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Vielen Dank für deine Spende, ${userName}`,
        html: `
          <p>Liebe*r ${userName}</p>
          <p>Wir haben deine Spielzeugspende <strong>${toyName}</strong> erhalten und werden sie schnellstmöglich prüfen. Sobald deine Spende für die Spielzeugbörse freigegeben ist, siehst du sie auch in deinem persönlichen Spendeportal.</p>
          <p>Weihnachten ist noch etwas hin. Bitte halte die gespendeten Spielsachen ab <strong>${openingDate}</strong> griffbereit, da wir die Börse dann öffnen. Sobald dein Spielzeug ausgewählt wurde, erhältst du eine E-Mail mit den entsprechenden Versanddetails.</p>
          <p>Schön, dass du Teil unseres Projekts bist.</p>
          ${SIGNATURE}
        `,
    });
}

// ── #2: Donation approved ──────────────────────────────────────────────────
export async function sendDonationApprovedEmail(
    to: string,
    userName: string,
    toyName: string
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Deine Spende ${toyName} ist nun freigeschaltet`,
        html: `
          <p>Liebe*r ${userName}</p>
          <p>Wir haben deine Spende <strong>${toyName}</strong> mit Freude für die Spielzeugbörse freigeschaltet. Sie hat unsere interne Qualitätsprüfung überstanden und wartet nun darauf, von einem Kind ausgesucht zu werden.</p>
          <p>Ab sofort siehst du deine Spende in deinem persönlichen Spendeportal, wenn du dich auf unserer Webseite anmeldest. Da kannst du sie auch bearbeiten oder schlimmstenfalls auch löschen.</p>
          ${SIGNATURE}
        `,
    });
}

// ── #3: Donation rejected ──────────────────────────────────────────────────
export async function sendDonationRejectedEmail(
    to: string,
    userName: string,
    toyName: string
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Deine Spende ${toyName} wurde leider nicht freigeschalten`,
        html: `
          <p>Liebe*r ${userName}</p>
          <p>Leider können wir deine Spielzeugspende <strong>${toyName}</strong> diesmal nicht für unsere Spielzeugbörse freischalten.</p>
          <p>Falls du Fragen dazu hast, kannst du uns jederzeit unter <a href="mailto:hallo@waerme-schenken.ch">hallo@waerme-schenken.ch</a> kontaktieren.</p>
          <p>Herzlichen Dank für dein Engagement – wir schätzen deine Bereitschaft zu helfen sehr!</p>
          ${SIGNATURE}
        `,
    });
}

// ── #4: Donation selected by a family ─────────────────────────────────────
export async function sendDonationSelectedEmail(
    to: string,
    userName: string,
    toyName: string,
    recipientName: string,
    recipientAddress: string
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Yay, dein Spielzeug ${toyName} wurde ausgesucht`,
        html: `
          <p>Liebe*r ${userName}</p>
          <p>Es ist so weit! Dein Spielzeug <strong>"${toyName}"</strong> wurde von ${recipientName} ausgesucht. Also ab in eine Kartonbox und zur Post damit!</p>
          <p><strong>Hier ist die Versandadresse:</strong></p>
          <p style="font-family:monospace;background:#f5f5f5;padding:12px;border-radius:8px;">${recipientName}<br/>${recipientAddress}</p>
          <p>Bitte ändere den Status deiner Spende in deinem Spendenportal auf <em>"In Bearbeitung"</em> und dann auf <em>"Verschickt"</em>. Die Tracking Nummer kannst du auch im Portal hinterlegen. So ist ${recipientName} immer über den aktuellen Stand deines Geschenks informiert.</p>
          ${SIGNATURE}
        `,
    });
}

// ── #5: Reminder — Donation selected but not yet shipped ──────────────────
export async function sendDonationReminderEmail(
    to: string,
    userName: string,
    toyName: string,
    recipientName: string,
    recipientAddress: string
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Reminder: Dein Spielzeug ${toyName} wurde ausgesucht`,
        html: `
          <p>Liebe*r ${userName}</p>
          <p>Dein Spielzeug <strong>"${toyName}"</strong> wurde vor einigen Tagen von ${recipientName} ausgesucht. Also ab in eine Kartonbox und zur Post damit!</p>
          <p><strong>Hier ist die Versandadresse:</strong></p>
          <p style="font-family:monospace;background:#f5f5f5;padding:12px;border-radius:8px;">${recipientName}<br/>${recipientAddress}</p>
          <p>Bitte ändere den Status deiner Spende in deinem Spendenportal auf <em>"In Bearbeitung"</em> und dann auf <em>"Verschickt"</em>. Die Tracking Nummer kannst du auch im Portal hinterlegen. So ist ${recipientName} immer über den aktuellen Stand deines Geschenks informiert.</p>
          ${SIGNATURE}
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
          ${SIGNATURE}
        `,
    });
}
