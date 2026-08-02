import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { FamilySidebar } from '@/components/ui/FamilySidebar';
import { FamilyBottomNav } from '@/components/ui/FamilyBottomNav';
import { CartAddedToast } from '@/components/ui/CartAddedToast';
import { CartSync } from '@/components/ui/CartSync';

/**
 * Shared layout for authenticated Family pages.
 * - Requires logged-in family user.
 * - If approval required & not yet approved → redirect to /family/pending.
 */
export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect('/family/login');

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) redirect('/family/login');
    if (user.role !== 'family') redirect('/donor/dashboard');

    const settings = await db.appSettings.findUnique({ where: { id: 'singleton' } }).catch(() => null);
    const requireApproval = settings?.familyApprovalRequired ?? true;
    const isSpecial = (user as { familySpecial?: boolean }).familySpecial === true;
    if (requireApproval && !user.familyApproved && !isSpecial) redirect('/family/pending');

    // Count how many toys this family has actually selected (server-side truth)
    const serverSelectedCount = await db.donation.count({
        where: { selectedByFamilyId: session.userId, status: { in: ['selected', 'sent'] } },
    });

    return (
        <div className="min-h-screen flex bg-[#F5F0EA]">
            <FamilySidebar />
            <main className="flex-1 md:ml-64 min-h-screen min-w-0 overflow-x-hidden">
                {children}
            </main>
            <FamilyBottomNav />
            <CartAddedToast />
            <CartSync serverSelectedCount={serverSelectedCount} />
        </div>
    );
}

