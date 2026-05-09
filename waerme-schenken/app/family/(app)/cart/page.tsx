import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { BRAND } from '@/lib/constants';
import { CartView } from './CartView';

export default async function FamilyCartPage() {
    const session = await getSession();
    if (!session) redirect('/family/login');

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) redirect('/family/login');

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: BRAND.beige }}>
            <CartView
                family={{
                    firstName: user.firstName,
                    lastName:  user.lastName,
                    street:    user.street || '',
                    zipCode:   user.zipCode || '',
                    city:      user.city   || '',
                }}
            />
        </div>
    );
}
