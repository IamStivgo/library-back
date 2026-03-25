import { OAuth2Client } from 'google-auth-library';
import { ENVS } from '@util';

export interface GoogleUserInfo {
    googleId: string;
    email: string;
    name: string;
    picture: string;
    emailVerified: boolean;
}

export class GoogleAuthService {
    private static client = new OAuth2Client(ENVS.GOOGLE_CLIENT_ID);

    static async verifyGoogleToken(token: string): Promise<GoogleUserInfo | null> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: token,
                audience: ENVS.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.sub || !payload.email) {
                return null;
            }

            return {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name || '',
                picture: payload.picture || '',
                emailVerified: payload.email_verified || false,
            };
        } catch (error) {
            console.error('Error verifying Google token:', error);
            return null;
        }
    }
}
