import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function FinancialSupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await db.appSettings.findUnique({ where: { id: 'singleton' } });

    // If the feature is disabled, redirect any direct access attempts back to the profile
    if (!settings || !settings.financialSupportEnabled) {
        redirect('/donor/profile');
    }

    return <>{children}</>;
}
