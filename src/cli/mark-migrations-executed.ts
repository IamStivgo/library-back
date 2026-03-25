#!/usr/bin/env node
import dotenv from 'dotenv';
import 'module-alias/register';
dotenv.config();

import { pool } from '../infrastructure/database/postgres.adapter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This script marks all migrations as executed without running them.
 * Useful when the tables already exist in the database but there are no records in schema_migrations.
 */
async function markAllAsExecuted() {
    try {
        console.log('🔧 Marking existing migrations as executed...\n');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const migrationsPath = path.join(__dirname, '../../migrations');
        const files = fs
            .readdirSync(migrationsPath)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        console.log(`📋 Found ${files.length} migration file(s):\n`);

        for (const file of files) {
            try {
                const checkResult = await pool.query(
                    'SELECT migration_name FROM schema_migrations WHERE migration_name = $1',
                    [file],
                );

                if (checkResult.rows.length > 0) {
                    console.log(`  ⊙ Already marked: ${file}`);
                } else {
                    await pool.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [file]);
                    console.log(`  ✓ Marked: ${file}`);
                }
            } catch (error: any) {
                console.error(`  ✗ Error marking ${file}:`, error.message);
            }
        }

        console.log(`\n✅ Process completed. All migrations marked as executed.\n`);
        console.log('💡 You can now run your server. New migrations will execute normally.\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

markAllAsExecuted();
