import { SignJWT, jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const PURPOSE = 'social-card-upload';

/**
 * Short-lived signed ticket that authorises a single social-card upload
 * during registration (when no session exists yet). Prevents the upload
 * endpoint from being hit directly / hotlinked by callers that never went
 * through our registration flow.
 */
export async function issueUploadTicket(): Promise<string> {
    return new SignJWT({ purpose: PURPOSE })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(SECRET);
}

export async function verifyUploadTicket(token: string | null | undefined): Promise<boolean> {
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload.purpose === PURPOSE;
    } catch {
        return false;
    }
}
