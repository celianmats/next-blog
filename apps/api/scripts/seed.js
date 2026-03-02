const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/republik',
});

async function seed() {
    console.log('🌱 Seeding database with initial data...');

    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert Admin User
        await pool.query(`
            INSERT INTO users (email, password_hash, role, full_name)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO NOTHING
        `, ['admin@republik.ch', hashedPassword, 'admin', 'Admin User']);

        // Insert Categories
        const catRes = await pool.query(`
            INSERT INTO categories (slug, name_translations)
            VALUES 
                ('politics', '{"en": "Politics", "fr": "Politique", "ar": "سياسة"}'),
                ('culture', '{"en": "Culture", "fr": "Culture", "ar": "ثقافة"}')
            ON CONFLICT (slug) DO NOTHING
            RETURNING id, slug
        `);

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
