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

        // 1. Insert Admin User
        await pool.query(`
            INSERT INTO users (email, password_hash, role, name, is_verified, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO NOTHING
        `, ['admin@republik.ch', hashedPassword, 'admin', 'Admin User', true, true]);

        // 2. Insert Categories
        const categories = [
            { slug: 'politics', translations: { en: 'Politics', fr: 'Politique', ar: 'سياسة' } },
            { slug: 'culture', translations: { en: 'Culture', fr: 'Culture', ar: 'ثقافة' } }
        ];

        for (const cat of categories) {
            const catRes = await pool.query(`
                INSERT INTO categories (slug)
                VALUES ($1)
                ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
                RETURNING id
            `, [cat.slug]);

            const categoryId = catRes.rows[0].id;

            for (const [locale, name] of Object.entries(cat.translations)) {
                await pool.query(`
                    INSERT INTO category_translations (category_id, locale, name)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name
                `, [categoryId, locale, name]);
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
