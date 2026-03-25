import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { pool } from './postgres.adapter';

export class MigrationRunner {
    private db: Pool;
    private migrationsPath: string;

    constructor() {
        this.db = pool;
        this.migrationsPath = path.join(__dirname, '../../../migrations');
    }

    private async ensureMigrationsTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await this.db.query(query);
        console.log('✓ Migrations table ready');
    }

    private async getExecutedMigrations(): Promise<Set<string>> {
        const result = await this.db.query('SELECT migration_name FROM schema_migrations ORDER BY migration_name');
        return new Set(result.rows.map((row) => row.migration_name));
    }

    private async markMigrationAsExecuted(migrationName: string): Promise<void> {
        await this.db.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [migrationName]);
    }

    private async executeMigration(filePath: string, migrationName: string): Promise<void> {
        const sql = fs.readFileSync(filePath, 'utf-8');

        try {
            console.log(`  ► Executing: ${migrationName}`);
            await this.db.query(sql);
            await this.markMigrationAsExecuted(migrationName);
            console.log(`  ✓ Completed: ${migrationName}`);
        } catch (error: any) {
            console.error(`  ✗ Failed: ${migrationName}`);
            console.error(`    Error: ${error.message}`);
            throw error;
        }
    }

    async runMigrations(): Promise<void> {
        try {
            console.log('\n🚀 Starting database migrations...\n');

            await this.ensureMigrationsTable();

            const executedMigrations = await this.getExecutedMigrations();

            if (!fs.existsSync(this.migrationsPath)) {
                console.log('⚠️  No migrations directory found');
                return;
            }

            const files = fs
                .readdirSync(this.migrationsPath)
                .filter((file) => file.endsWith('.sql'))
                .sort();

            if (files.length === 0) {
                console.log('⚠️  No migration files found');
                return;
            }

            const pendingMigrations = files.filter((file) => !executedMigrations.has(file));

            if (pendingMigrations.length === 0) {
                console.log('✓ All migrations are up to date\n');
                return;
            }

            console.log(`📋 Found ${pendingMigrations.length} pending migration(s):\n`);

            for (const file of pendingMigrations) {
                const filePath = path.join(this.migrationsPath, file);
                await this.executeMigration(filePath, file);
            }

            console.log(`\n✅ Successfully executed ${pendingMigrations.length} migration(s)\n`);
        } catch (error: any) {
            console.error('\n❌ Migration failed:', error.message);
            throw error;
        }
    }

    async rollbackLastMigration(): Promise<void> {
        try {
            const result = await this.db.query(
                'SELECT migration_name FROM schema_migrations ORDER BY executed_at DESC LIMIT 1',
            );

            if (result.rows.length === 0) {
                console.log('⚠️  No migrations to rollback');
                return;
            }

            const lastMigration = result.rows[0].migration_name;
            console.log(`🔄 Rolling back: ${lastMigration}`);

            await this.db.query('DELETE FROM schema_migrations WHERE migration_name = $1', [lastMigration]);

            console.log(`✓ Rolled back: ${lastMigration}`);
            console.log('⚠️  Note: This only removes the migration record. Manual cleanup may be required.');
        } catch (error: any) {
            console.error('❌ Rollback failed:', error.message);
            throw error;
        }
    }

    async showMigrationStatus(): Promise<void> {
        try {
            await this.ensureMigrationsTable();

            const executedMigrations = await this.getExecutedMigrations();

            if (!fs.existsSync(this.migrationsPath)) {
                console.log('⚠️  No migrations directory found');
                return;
            }

            const files = fs
                .readdirSync(this.migrationsPath)
                .filter((file) => file.endsWith('.sql'))
                .sort();

            console.log('\n📊 Migration Status:\n');
            console.log('─'.repeat(70));

            if (files.length === 0) {
                console.log('No migration files found');
            } else {
                files.forEach((file) => {
                    const status = executedMigrations.has(file) ? '✓ Executed' : '⧗ Pending';
                    console.log(`${status.padEnd(12)} │ ${file}`);
                });
            }

            console.log('─'.repeat(70));
            console.log(
                `\nTotal: ${files.length} | Executed: ${executedMigrations.size} | Pending: ${
                    files.length - executedMigrations.size
                }\n`,
            );
        } catch (error: any) {
            console.error('❌ Failed to show migration status:', error.message);
            throw error;
        }
    }
}

export const migrationRunner = new MigrationRunner();
