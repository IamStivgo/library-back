#!/usr/bin/env node
import dotenv from 'dotenv';
import 'module-alias/register';
dotenv.config();

import { pool } from '../infrastructure/database/postgres.adapter';

/**
 * Removes the record of a specific migration to allow it to be re-executed.
 * Useful when a migration failed or needs to be corrected.
 */
async function resetMigration() {
    const migrationName = process.argv[2];

    if (!migrationName) {
        console.log(`
📝 Reset a specific migration

Usage:
  npm run migrate:reset <migration-name>

Example:
  npm run migrate:reset 002_seed_sample_books.sql

This will remove the migration record, allowing it to be re-executed.
        `);
        process.exit(0);
    }

    try {
        console.log(`\n🔄 Resetting migration: ${migrationName}\n`);

        const checkResult = await pool.query('SELECT migration_name FROM schema_migrations WHERE migration_name = $1', [
            migrationName,
        ]);

        if (checkResult.rows.length === 0) {
            console.log(`⚠️  Migration "${migrationName}" is not in the executed list.`);
            console.log(`   Nothing to reset.\n`);
            process.exit(0);
        }

        await pool.query('DELETE FROM schema_migrations WHERE migration_name = $1', [migrationName]);

        console.log(`✓ Migration "${migrationName}" has been reset.`);
        console.log(`\n💡 You can now re-run it with:`);
        console.log(`   npm run migrate:run`);
        console.log(`   or`);
        console.log(`   npm run dev\n`);

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

resetMigration();
