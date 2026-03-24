import { Pool, PoolConfig } from 'pg';
import { ENVS } from '@util';

const config: PoolConfig = {
    host: ENVS.DB_HOST,
    port: parseInt(ENVS.DB_PORT, 10),
    database: ENVS.DB_NAME,
    user: ENVS.DB_USER,
    password: ENVS.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

export const pool = new Pool(config);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const testConnection = async (): Promise<void> => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully');
        client.release();
    } catch (error) {
        console.error('❌ Error connecting to PostgreSQL:', error);
        throw error;
    }
};
