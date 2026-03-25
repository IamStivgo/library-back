import { ConfidentialClientApplication } from '@azure/msal-node';
import { ENVS } from '@util';

export interface MicrosoftUserInfo {
    microsoftId: string;
    email: string;
    name: string;
    picture?: string;
    emailVerified: boolean;
}

export class MicrosoftAuthService {
    private static msalClient: ConfidentialClientApplication | null = null;

    private static initializeClient() {
        if (!this.msalClient && ENVS.MICROSOFT_CLIENT_ID && ENVS.MICROSOFT_CLIENT_SECRET) {
            this.msalClient = new ConfidentialClientApplication({
                auth: {
                    clientId: ENVS.MICROSOFT_CLIENT_ID,
                    authority: `https://login.microsoftonline.com/${ENVS.MICROSOFT_TENANT_ID || 'common'}`,
                    clientSecret: ENVS.MICROSOFT_CLIENT_SECRET,
                },
            });
        }
    }

    static async verifyMicrosoftToken(accessToken: string): Promise<MicrosoftUserInfo | null> {
        try {
            this.initializeClient();

            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                return null;
            }

            const profile = await response.json();

            return {
                microsoftId: profile.id,
                email: profile.mail || profile.userPrincipalName,
                name: profile.displayName || profile.givenName + ' ' + profile.surname,
                picture: undefined,
                emailVerified: true,
            };
        } catch (error) {
            console.error('Error verifying Microsoft token:', error);
            return null;
        }
    }
}
