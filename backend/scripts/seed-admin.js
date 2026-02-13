import { initDb } from '../src/db/db.js';
import bcrypt from 'bcrypt';

const admin_mail = process.env.ADMIN_MAIL || 'admin@quai-antique.com';
const admin_password = process.env.ADMIN_PASSWORD || 'admin123';


async function seedAdmin() {
    const db = await initDb();
    try {
        // Check if admin user already exists
        const existingAdmin = await db.get(
            `SELECT * FROM accounts WHERE email = ? AND access_level = 'admin'`,
            [admin_mail]
        )
        if (existingAdmin) {
        console.log('Admin user already exists. Skipping seeding.');
        return;
        }
        const passwordHash = await bcrypt.hash(admin_password, 10);
        const adminResult = await db.run(
            `INSERT INTO accounts (email, password_hash, access_level) 
            VALUES (?, ?, ?)`,
            [admin_mail, passwordHash, 'admin']
        )

        const adminId = adminResult.lastID;
        await db.run(
            `INSERT INTO users (account_id, first_name, last_name) VALUES (?, ?, ?)`,
            [adminId, 'Admin', 'User']
        )
        console.log('Admin user seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedAdmin();