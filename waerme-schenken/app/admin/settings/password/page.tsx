import { AdminHeader } from '../../components/AdminHeader';
import { PasswordChangeForm } from './PasswordChangeForm';

export const dynamic = 'force-dynamic';

export default function AdminChangePasswordPage() {
    return (
        <>
            <AdminHeader />
            <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    Passwort ändern
                </h2>
                <div className="bg-white rounded-[8px] p-6 md:p-8 shadow-sm border border-gray-100 max-w-lg">
                    <PasswordChangeForm />
                </div>
            </main>
        </>
    );
}
