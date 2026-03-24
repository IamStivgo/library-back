import dotenv from 'dotenv';
import 'module-alias/register';
dotenv.config();
import { application } from './Application';
import { createDependencyContainer } from '@configuration';
import { validateEnvs, ENVS } from '@util';
import { testConnection } from '@infrastructure/database';

const start = async () => {
    try {
        validateEnvs();

        await testConnection();

        createDependencyContainer();

        const port = Number(ENVS.PORT) || 5000;
        const host = ENVS.HOST || '0.0.0.0';

        await application.listen({ port, host });
        console.log(`🚀 Library Management API running on http://${host}:${port}${ENVS.PREFIX_URL}`);
        console.log(`📚 Health check: http://${host}:${port}${ENVS.PREFIX_URL}/healthcheck`);
    } catch (error) {
        console.error('❌ Error starting server:', error);
        await application.close();
        process.exit(1);
    }
};

start();
