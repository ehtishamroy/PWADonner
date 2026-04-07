// All German UI strings — single source of truth
export const de = {
    // ── App ──
    appName: 'Wärme schenken',
    appTagline: 'Freude weitergeben',

    // ── Splash ──
    splash: {
        title: 'Wärme\nschenken',
    },

    // ── Split Screen ──
    split: {
        heading: 'Freude weitergeben',
        body: 'Gemeinsam Freude schenken. Mit dieser App kannst du Spielzeug spenden oder als Familie in schwieriger Lage auswählen.',
        family: 'Familie',
        donor: 'Spender',
    },

    // ── Intro ──
    intro: {
        heading: "So geht's",
        step1: { title: '1. Registrieren oder einloggen', body: 'Erstelle in wenigen Schritten dein kostenloses Konto.' },
        step2: { title: '2. Spielzeug spenden',           body: 'Füge deine Spielzeuge hinzu und warte auf die Freigabe.' },
        step3: { title: '3. Per Post versenden',          body: 'Sobald eine Familie dein Spielzeug auswählt, sendest du es zu.' },
        cta: 'Jetzt mitmachen',
        back: 'Zurück',
    },

    // ── Auth ──
    auth: {
        register: {
            heading: 'Hallo! Du bist...',
            stepDetails: 'Deine Daten',
            stepNewsletter: 'Newsletter',
            stepOtp: 'Bestätigung',
            firstName: 'Vorname',
            lastName: 'Nachname',
            email: 'E-Mail',
            privacy: 'Akzeptiere unseren Datenschutz. Mit der Registrierung akzeptierst du unsere',
            privacyLink: 'Datenschutzerklärung',
            newsletter: 'Ja, ich möchte den Newsletter erhalten.',
            next: 'Weiter',
            alreadyAccount: 'Bereits ein Konto?',
            login: 'Jetzt einloggen',
        },
        login: {
            heading: 'Willkommen zurück',
            emailLabel: 'E-Mail-Adresse',
            emailPlaceholder: 'deine@email.ch',
            cta: 'Anmelden',
            noAccount: 'Noch kein Konto?',
            register: 'Jetzt registrieren',
        },
        otp: {
            heading: 'Code eingeben',
            body: 'Wir haben dir ein Einmalpasswort gesendet an',
            label: '6-stelliger Code',
            cta: 'Bestätigen',
            resend: 'Neuen Code senden',
            noEmail: 'Keine E-Mail erhalten?',
        },
        errors: {
            emailInvalid: 'Bitte gib eine gültige E-Mail-Adresse ein.',
            otpInvalid: 'Der Code ist ungültig oder abgelaufen.',
            otpRateLimit: 'Zu viele Versuche. Bitte warte kurz.',
            required: 'Dieses Feld ist erforderlich.',
        },
    },

    // ── Dashboard ──
    dashboard: {
        news: 'News',
        donationOverview: 'Meine Spenden',
        facts: 'Fakten',
        factsCount: 'Spielsachen wurden bereits gespendet:',
        factsMoney: 'So viel Geld wurde bereits gespendet.',
        empty: 'Du hast noch keine Spielzeuge hinzugefügt.',
        addFirst: 'Erste Spende hinzufügen',
    },

    // ── Donation Status ──
    status: {
        waiting:  'Warten',
        approved: 'Freigegeben',
        selected: 'Ausgewählt',
        sent:     'Gesendet',
        rejected: 'Abgelehnt',
    },

    // ── Add Donation ──
    donate: {
        heading: 'Spielzeug spenden',
        step1: 'Details',
        step2: 'Fotos',
        step3: 'Überprüfen',
        toyName: 'Name des Spielzeugs',
        category: 'Kategorie',
        ageRange: 'Altersgruppe',
        condition: 'Zustand',
        description: 'Beschreibung',
        descriptionPlaceholder: 'Erzähl etwas über das Spielzeug...',
        uploadImages: 'Fotos hochladen',
        uploadHint: 'PNG, JPG bis 3 MB (max. 3 Fotos)',
        reviewTitle: 'Überprüfe deine Angaben',
        submit: 'Spende einreichen',
        submitting: 'Wird eingereicht...',
        successTitle: 'Danke für deine Spende!',
        successBody: 'Wir prüfen deine Angaben und melden uns bei dir.',
    },

    // ── Donation Detail ──
    donationDetail: {
        whoSelected: 'Wer hat ausgewählt?',
        address: 'Adresse',
        sendTo: 'Bitte sende das Spielzeug an diese Adresse.',
        trackingNumber: 'Sendungsverfolgungsnummer (optional)',
        markSent: 'Als gesendet markieren',
        delete: 'Spende löschen',
        deleteConfirm: 'Möchtest du diese Spende wirklich löschen?',
        deleteConfirmBtn: 'Ja, löschen',
        cancel: 'Abbrechen',
    },

    // ── Profile ──
    profile: {
        greeting: 'Hallo',
        details: 'Deine Daten',
        address: 'Adresse',
        addressHint: 'Bitte halte deine Adresse aktuell.',
        edit: 'Bearbeiten',
        save: 'Speichern',
        mailings: 'Mailings',
        privacy: 'Datenschutz',
        about: 'Über Wärme schenken',
        deleteProfile: 'Profil löschen',
        deleteConfirm: 'Möchtest du dein Profil wirklich löschen? Alle Daten werden gelöscht.',
    },

    // ── Nav ──
    nav: {
        home: 'Home',
        donate: 'Neue Spende',
        profile: 'Profil',
        logout: 'Abmelden',
    },

    // ── Common ──
    common: {
        back: 'Zurück',
        next: 'Weiter',
        save: 'Speichern',
        cancel: 'Abbrechen',
        loading: 'Laden...',
        error: 'Etwas ist schiefgelaufen.',
        retry: 'Erneut versuchen',
    },
} as const;
