import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const resCat = await client.query(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      ['General', 'general', 'Seed category'],
    );
    const categoryId = resCat.rows[0].id;

    const resTag = await client.query(
      `INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      ['SeedTag', 'seed-tag'],
    );
    const tagId = resTag.rows[0].id;

    const resArticle = await client.query(
      `INSERT INTO articles (title, slug, excerpt, content, category, category_id, image_url, image_alt, read_time, word_count, featured, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title RETURNING id`,
      [
        'Seed Article',
        'seed-article',
        'Seed excerpt',
        'Seed content',
        'General',
        categoryId,
        null,
        null,
        1,
        100,
        true,
        'published',
      ],
    );
    const articleId = resArticle.rows[0].id;

    await client.query(
      `INSERT INTO article_tags (article_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [articleId, tagId],
    );

    await client.query(
      `INSERT INTO species (common_name, scientific_name, slug, kingdom) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO UPDATE SET common_name=EXCLUDED.common_name`,
      ['Seed Species', 'Species seedus', 'seed-species', 'Animalia'],
    );

    await client.query(
      `INSERT INTO portfolio_clips (title, publication, url, date, category) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      ['Seed Clip', 'Seed Pub', 'https://example.com', '2026-05-28', 'General'],
    );

    await client.query(
      `INSERT INTO newsletter_subscribers (email, name) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING`,
      ['seed+1@example.com', 'Seed Subscriber'],
    );

    await client.query(
      `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1,$2,$3,$4)`,
      ['Seed Contact', 'contact@example.com', 'Hello', 'Seed message'],
    );

    await client.query('COMMIT');
    console.log('Seeding completed');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
