import { initDb } from '../src/db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryDir = path.join(__dirname, '../uploads/gallery');

async function seedGallery() {
  const db = await initDb();

  const files = fs.readdirSync(galleryDir).filter(f =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );

  let added = 0;
  for (const file of files) {
    const imageUrl = `/uploads/gallery/${file}`;
    const existing = await db.get('SELECT id FROM gallery_images WHERE image_url = ?', imageUrl);
    if (existing) continue;

    const title = file
      .replace(/^\d+_/, '')
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ');

    await db.run('INSERT INTO gallery_images (title, image_url) VALUES (?, ?)', [title, imageUrl]);
    added++;
  }

  console.log(`Seeded ${added} gallery image(s). Skipped ${files.length - added} already present.`);
  process.exit(0);
}

seedGallery().catch(err => {
  console.error(err);
  process.exit(1);
});
