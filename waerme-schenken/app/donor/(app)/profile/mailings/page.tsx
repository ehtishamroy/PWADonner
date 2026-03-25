import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import NewsletterToggle from './NewsletterToggle';

export const metadata = {
    title: 'Newsletter',
};

export default async function MailingsPage() {
    const session = await getSession();
    if (!session) redirect('/api/auth/clear-session');

    const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { newsletterConsent: true, email: true }
    });

    if (!user) redirect('/api/auth/clear-session');

    return (
        <div className="min-h-screen pt-12 px-5 pb-24" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md mx-auto">
                <Link href="/donor/profile" className="inline-flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Zurück
                    </span>
                </Link>

                <div className="bg-white rounded-[28px] p-7 md:p-10 shadow-sm mb-6">
                    <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Anmeldung zum Infomailing
                    </h1>
                    
                    <p className="opacity-80 leading-relaxed">
                        Wir versenden keine regelmässigen Newsletter, sondern nur punktuell bei wichtigen Neuigkeiten. Keine Angst, uns fehlt die Zeit, deine Inbox zu spammen.
                    </p>

                    <NewsletterToggle initialConsent={user.newsletterConsent} />
                </div>
            </div>
        </div>
    );
}
