import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = 'Wärme Schenken <hallo@waerme-schenken.ch>';
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
        subject: `Vielen Dank für deine Spende ${userName}`,
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Deine Spende wird gerade noch überprüft</span>
          <h2>Herzlichen Dank für deine Spende!</h2>
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
          <span style="display:none;max-height:0;overflow:hidden;">Deine Spende macht unsere Börse bunter.</span>
          <h2>Glückwunsch!</h2>
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
    recipientAddress: string,
    toyImageUrl?: string | null
) {
    const imageBlock = toyImageUrl
        ? `<p><img src="${toyImageUrl}" alt="${toyName}" style="max-width:300px;border-radius:8px;display:block;margin:12px 0;" /></p>`
        : '';
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Yay, dein Spielzeug ${toyName} wurde ausgesucht`,
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Vergiss nicht, den Status der Spende im Portal anzupassen.</span>
          <h2>Dein Spielzeug wurde ausgesucht!</h2>
          <p>Liebe*r ${userName}</p>
          <p>Es ist so weit! Dein Spielzeug <strong>"${toyName}"</strong> wurde von ${recipientName} ausgesucht. Also ab in eine Kartonbox und zur Post damit!</p>
          <p><strong>Hier ist die Versandadresse:</strong></p>
          <p style="font-family:monospace;background:#f5f5f5;padding:12px;border-radius:8px;">${recipientName}<br/>${recipientAddress}</p>
          ${imageBlock}
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
    recipientAddress: string,
    toyImageUrl?: string | null
) {
    const imageBlock = toyImageUrl
        ? `<p><img src="${toyImageUrl}" alt="${toyName}" style="max-width:300px;border-radius:8px;display:block;margin:12px 0;" /></p>`
        : '';
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Reminder: Dein Spielzeug ${toyName} wurde ausgesucht`,
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Vergiss nicht, den Status der Spende im Portal anzupassen.</span>
          <h2>Dein Spielzeug wurde ausgesucht!</h2>
          <p>Liebe*r ${userName}</p>
          <p>Dein Spielzeug <strong>"${toyName}"</strong> wurde vor einigen Tagen von ${recipientName} ausgesucht. Also ab in eine Kartonbox und zur Post damit!</p>
          <p><strong>Hier ist die Versandadresse:</strong></p>
          <p style="font-family:monospace;background:#f5f5f5;padding:12px;border-radius:8px;">${recipientName}<br/>${recipientAddress}</p>
          ${imageBlock}
          <p>Bitte ändere den Status deiner Spende in deinem Spendenportal auf <em>"In Bearbeitung"</em> und dann auf <em>"Verschickt"</em>. Die Tracking Nummer kannst du auch im Portal hinterlegen. So ist ${recipientName} immer über den aktuellen Stand deines Geschenks informiert.</p>
          ${SIGNATURE}
        `,
    });
}

// ── #5: Family Registration Received ──────────────────────────────────────
export async function sendFamilyRegistrationReceivedEmail(
    to: string,
    userName: string,
    openingDate = 'demnächst',
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Vielen Dank für deine Registrierung, ${userName}`,
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Wir prüfen gerade deine Registrierung.</span>
          <h2>Deine Registrierung wird geprüft</h2>
          <p>Liebe*r ${userName}</p>
          <p>Vielen Dank für deine Registrierung. Schön, bist du bei unserem Projekt dabei.</p>
          <p>Dein Zugang wird innert 48 Stunden geprüft und freigeschaltet. Sollte es ein Problem geben, werden wir uns mit dir in Verbindung setzen.</p>
          <p><strong>Achtung:</strong> Die Spielzeugbörse öffnet am ${openingDate}.</p>
          <p>Catharina, Gaby &amp; Vanessa</p>
        `,
    });
}

// ── #6: Family Registration Approved ──────────────────────────────────────
export async function sendFamilyRegistrationApprovedEmail(
    to: string,
    userName: string,
    loginUrl = 'https://app.waerme-schenken.ch/family/login',
    openingDate = 'demnächst',
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: `Deine Registrierung war erfolgreich, ${userName}`,
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Wir haben deinen Zugang freigeschaltet.</span>
          <h2>Du hast nun Zugang zur Spielzeugbörse</h2>
          <p>Liebe*r ${userName}</p>
          <p>Nach erfolgreicher Prüfung deiner Registrierung, haben wir dir deinen Zugang nun freigeschaltet.</p>
          <p>Melde dich hier an und gelange zu deinem Portal:</p>
          <p><a href="${loginUrl}" style="background:#537D61;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;display:inline-block;font-weight:700;">Zur Spielzeugbörse</a></p>
          <p>Dort siehst du, wie viele und welche Spielsachen du ausgewählt hast. Du kannst auch den Status deiner Spielsachen verfolgen: Spender*innen können angeben, ob sie das Spielzeug verpackt haben, das Päckli bereits zur Post gebracht haben und sie können die Trackingnummer hinterlegen. So bleibst du stets auf dem Laufenden.</p>
          <p><strong>Achtung:</strong> Die Spielzeugbörse öffnet am ${openingDate}.</p>
          <p>Falls du deinen Wohnsitz wechseln solltest, kannst du die Adresse ganz einfach in deinem Profil aktualisieren. Damit die Pakete bei dir ankommen, ist es wichtig, dass die Adresse stimmt.</p>
          <p>Wir wünschen dir viel Spass und schön, bist du mit dabei!</p>
          <p>Alles Liebe<br/>Catharina, Gaby &amp; Vanessa</p>
        `,
    });
}

// ── #7: Family Order Received ─────────────────────────────────────────────
export async function sendFamilyOrderReceivedEmail(
    to: string,
    userName: string,
    toys: { toyName: string }[],
    portalUrl = 'https://app.waerme-schenken.ch/family/dashboard',
) {
    const toyNames = toys.map(t => t.toyName).join(', ');
    return resend.emails.send({
        from:    FROM,
        to,
        subject: 'Schön, bist du in unserer Börse fündig geworden.',
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Der/Die Spender*in ist informiert.</span>
          <h2>Schön, bist du in der Börse fündig geworden</h2>
          <p>Liebe*r ${userName}</p>
          <p>Schön bist du in unserer Spielzeugbörse fündig geworden! Die Spender*innen der Spielsachen <strong>${toyNames}</strong> sind informiert und bringen die Pakete so rasch als möglich zur Post.</p>
          <p><a href="${portalUrl}" style="background:#537D61;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;display:inline-block;font-weight:700;">Zum Familienportal</a></p>
          <p>Im Portal kannst du den Status deiner Geschenke verfolgen. Du wirst informiert, sobald der/die Spender*in das Paket zur Post gebracht hat.</p>
          <p>Wir wünschen deinen Kindern viel Spass mit den neuen Spielsachen und deiner Familie frohe Festtage!</p>
          <p>Catharina, Gaby, Vanessa</p>
        `,
    });
}

// ── #8: Toy Deleted (donor removed a selected toy) ────────────────────────
export async function sendToyDeletedEmail(
    to: string,
    userName: string,
    toyName: string,
) {
    return resend.emails.send({
        from:    FROM,
        to,
        subject: 'Spielzeug leider nicht mehr verfügbar',
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Der/Die Spender*in hat das Spielzeug leider gelöscht.</span>
          <h2>Dein ausgewähltes Spielzeug ist leider nicht mehr verfügbar</h2>
          <p>Liebe*r ${userName}</p>
          <p>Es tut uns leid, aber der/die Spender*in hat das Spielzeug <strong>&ldquo;${toyName}&rdquo;</strong> leider gelöscht. Es kann sein, dass das Spielzeug nicht mehr auffindbar ist, oder anderweitig verschenkt wurde. Den genauen Grund kennen wir leider nicht.</p>
          <p>Such dir bitte ein neues Geschenk aus der Börse aus. Wir hoffen, dein Kind hat an dem neuen Spielzeug genau so viel Freude!</p>
          <p>Wir wünschen dir und deinen Lieben eine schöne Adventszeit und frohe Festtage.</p>
          <p>Liebe Grüsse<br/>Catharina, Gaby, Vanessa</p>
        `,
    });
}

// ── #9: Donation Sent (family notified, with optional tracking) ───────────
export async function sendDonationSentEmail(
    to: string,
    userName: string,
    toyName: string,
    trackingNumber?: string | null,
    portalUrl = 'https://app.waerme-schenken.ch/family/dashboard',
) {
    const trackingBlock = trackingNumber
        ? `<p><strong>Tracking ID:</strong> ${trackingNumber}</p>`
        : '';
    return resend.emails.send({
        from:    FROM,
        to,
        subject: 'Dein Geschenk ist auf dem Weg zu dir!',
        html: `
          <span style="display:none;max-height:0;overflow:hidden;">Das Paket wurde von dem/der Spender*in verschickt.</span>
          <h2>Dein Geschenk ist auf dem Weg zu dir!</h2>
          <p>Liebe*r ${userName}</p>
          <p>Die/Der Spender*in von deinem Geschenk <strong>&ldquo;${toyName}&rdquo;</strong> hat das Paket soeben zur Post gebracht. Bald sollte es bei dir eintreffen. Du kannst den Status und die Tracking ID deines Pakets im Portal verfolgen.</p>
          ${trackingBlock}
          <p><a href="${portalUrl}" style="background:#537D61;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;display:inline-block;font-weight:700;">Zum Familienportal</a></p>
          <p>Solltest du in deinem Päckli eine Karte mit den Kontaktangaben des Spender-Kindes finden, würde sich dieses Kind über ein kleines "Danke" in Form von ein paar Worten oder vielleicht einer Zeichnung freuen.</p>
          <p>Du kannst dem/der Spender*in auch über die App Danke sagen. Einfach anmelden und beim Spielzeug anklicken, dass du das Paket erhalten hast und eine Dankesnachricht verfassen.</p>
          <p>Machen wir uns gegenseitig zu Weihnachten eine Freude!</p>
          <p>Wir wünschen dir und deinen Lieben eine schöne Adventszeit und frohe Festtage.</p>
          <p>Liebe Grüsse<br/>Catharina, Gaby, Vanessa</p>
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
