import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const validEmail = process.env.ADMIN_EMAIL;
        const validPassword = process.env.ADMIN_PASSWORD;

        if (!validEmail || !validPassword) {
            return NextResponse.json({ error: 'Admin credentials not configured on server' }, { status: 500 });
        }

        if (email === validEmail && password === validPassword) {
            // Set httpOnly cookie for 7 days
            const cookieStore = await cookies();
            cookieStore.set({
                name: 'ws_admin_session',
                value: 'true',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60, // 7 days
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 });
    }
}
