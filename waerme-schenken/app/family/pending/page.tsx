import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Logo } from '@/components/brand/Logo';
import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import Link from 'next/link';

export default async function FamilyPendingPage() {
    const session = await getSession();
    if (!session) redirect('/family/login');

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) redirect('/family/login');
    if (user.role !== 'family') redirect('/donor/dashboard');

    // If already approved (or approval not required by settings), go to dashboard
    const settings = await db.appSettings.findUnique({ where: { id: 'singleton' } }).catch(() => null);
    const requireApproval = settings?.familyApprovalRequired ?? true;

    if (!requireApproval || user.familyApproved) {
        redirect('/family/dashboard');
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-8">
                    <Logo size={72} />
                </div>
                <h1 className="mb-4" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {de.family.register.pendingTitle}
                </h1>
                <p className="opacity-70 text-[15px] leading-relaxed mb-10">
                    {de.family.register.pendingBody}
                </p>
                <Link href="/family/logout"
                    className="inline-flex h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl active:scale-95 transition-transform items-center justify-center"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
                    ABMELDEN
                </Link>
            </div>
        </div>
    );
}
