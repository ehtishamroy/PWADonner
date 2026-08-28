import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Defence-in-depth: verify the admin session server-side, not just in
    // middleware. The login page is the only admin route reachable unauthenticated.
    const path = (await headers()).get('x-pathname') || '';
    if (path !== '/admin/login') {
        const session = await getAdminSession();
        if (!session) redirect('/admin/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {children}
        </div>
    );
}
