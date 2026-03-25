import { ENVS } from '@util';

export interface GitHubUserInfo {
    githubId: string;
    email: string;
    name: string;
    picture?: string;
    emailVerified: boolean;
}

export class GitHubAuthService {
    static async verifyGitHubToken(accessToken: string): Promise<GitHubUserInfo | null> {
        try {
            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            if (!userResponse.ok) {
                return null;
            }

            const user = await userResponse.json();

            let email = user.email;

            if (!email) {
                const emailsResponse = await fetch('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                });

                if (emailsResponse.ok) {
                    const emails = await emailsResponse.json();
                    const primaryEmail = emails.find((e: any) => e.primary);
                    if (primaryEmail) {
                        email = primaryEmail.email;
                    }
                }
            }

            if (!email) {
                return null;
            }

            return {
                githubId: user.id.toString(),
                email: email,
                name: user.name || user.login,
                picture: user.avatar_url,
                emailVerified: true,
            };
        } catch (error) {
            console.error('Error verifying GitHub token:', error);
            return null;
        }
    }
}
