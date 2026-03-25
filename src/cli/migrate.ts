#!/usr/bin/env node
import dotenv from 'dotenv';
import 'module-alias/register';
dotenv.config();

import { migrationRunner } from '../infrastructure/database';

const command = process.argv[2];

async function main() {
    try {
        switch (command) {
            case 'run':
                await migrationRunner.runMigrations();
                break;

            case 'status':
                await migrationRunner.showMigrationStatus();
                break;

            case 'rollback':
                await migrationRunner.rollbackLastMigration();
                break;

            default:
                console.log(`
📦 Database Migration CLI

Usage:
  npm run migrate:run      - Run pending migrations
  npm run migrate:status   - Show migration status
  npm run migrate:rollback - Rollback last migration

Commands:
  run      Execute all pending migrations
  status   Display current migration status
  rollback Remove last migration record (manual cleanup required)
                `);
                process.exit(0);
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration command failed:', error);
        process.exit(1);
    }
}

main();
