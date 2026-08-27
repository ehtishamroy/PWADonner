import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { DonorSidebar } from '@/components/ui/DonorSidebar';
import { BottomNav } from '@/components/ui/BottomNav';

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect('/donor/login');

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) redirect('/donor/login');
    if (user.role !== 'donor') redirect('/family/dashboard');

    return (
        <div className="min-h-screen flex bg-[#F5F0EA]">
            <DonorSidebar />
            <main className="flex-1 md:ml-64 min-h-screen min-w-0 overflow-x-hidden">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
