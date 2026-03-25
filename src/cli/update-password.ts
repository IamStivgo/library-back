#!/usr/bin/env node
import dotenv from 'dotenv';
import 'module-alias/register';
dotenv.config();

import * as bcrypt from 'bcryptjs';
import { pool } from '../infrastructure/database/postgres.adapter';

/**
 * Script para actualizar la contraseña de un usuario
 */
async function updateUserPassword() {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.log(`
🔐 Update User Password

Usage:
  npm run user:update-password <email> <new-password>

Example:
  npm run user:update-password admin@luminaledger.com Admin123!

Default Admin User:
  Email: admin@luminaledger.com
  Password: Admin123!
        `);
        process.exit(0);
    }

    try {
        console.log(`\n🔐 Updating password for: ${email}\n`);

        // Verificar que el usuario existe
        const userCheck = await pool.query('SELECT id, email, username FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length === 0) {
            console.log(`❌ User with email "${email}" not found.\n`);
            process.exit(1);
        }

        const user = userCheck.rows[0];
        console.log(`✓ User found: ${user.username || 'N/A'} (${user.email})`);

        // Generar nuevo hash
        console.log(`🔄 Generating password hash...`);
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2', [
            passwordHash,
            email,
        ]);

        console.log(`✓ Password updated successfully!`);
        console.log(`\n💡 You can now login with:`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${newPassword}\n`);

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

updateUserPassword();
