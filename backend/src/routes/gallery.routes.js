import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../db/db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '../../uploads');
const galleryUploadsDir = path.join(uploadsRoot, 'gallery');

fs.mkdirSync(galleryUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryUploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const images = await db.all('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json(
      images.map(img => ({
        id: img.id,
        title: img.title,
        imageUrl: img.image_url
      }))
    );
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})


// add new gallery image (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, imageUrl } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'titre et imageURL requis' });
    }

    const db = getDb();
    const result = await db.run(
      'INSERT INTO gallery_images (title, image_url) VALUES (?, ?)',
      [title, imageUrl]
    );

    res.status(201).json({
      id: result.lastID,
      title,
      imageUrl,
      message: 'succès'
    });
  } catch (err) {
    console.error('Create gallery image error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// upload gallery image file (admin only)
router.post(
  '/upload',
  verifyToken,
  requireAdmin,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Erreur titre' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Erreur image' });
      }

      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/gallery/${req.file.filename}`;
      const db = getDb();

      const result = await db.run(
        'INSERT INTO gallery_images (title, image_url) VALUES (?, ?)',
        [title, imageUrl]
      );

      res.status(201).json({
        id: result.lastID,
        title,
        imageUrl,
        message: 'succès'
      });
    } catch (err) {
      console.error('Upload gallery image error:', err);
      res.status(500).json({ error: 'Erreur de telechargement image' });
    }
  }
);

// update gallery image (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, imageUrl } = req.body;

    const db = getDb();
    const existing = await db.get('SELECT * FROM gallery_images WHERE id = ?', req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Image non trouve' });
    }

    if (!title && !imageUrl) {
      return res.status(400).json({ error: 'Erreur dans le valeur titre ou URL' });
    }

    const newTitle = title ?? existing.title;
    const newUrl = imageUrl ?? existing.image_url;

    const result = await db.run(
      'UPDATE gallery_images SET title = ?, image_url = ? WHERE id = ?',
      [newTitle, newUrl, req.params.id]
    );

    if (!result.changes) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({
      id: req.params.id,
      title: newTitle,
      imageUrl: newUrl,
      message: 'succès'
    });
  } catch (err) {
    console.error('Update gallery image error:', err);
    res.status(500).json({ error: 'Erreur mis a jour' });
  }
});

// modify gallery image file (admin only)
router.put(
  '/:id/upload',
  verifyToken,
  requireAdmin,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const db = getDb();
      const existing = await db.get('SELECT * FROM gallery_images WHERE id = ?', req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Image pas trouve' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Fichier image requis' });
      }

      // Delete previous file if it was stored locally
      const fileSegment = '/uploads/gallery/';
      if (existing.image_url && existing.image_url.includes(fileSegment)) {
        const prevName = existing.image_url.split(fileSegment)[1];
        const prevPath = path.join(galleryUploadsDir, prevName);
        fs.unlink(prevPath, () => { });
      }

      const newTitle = req.body.title ?? existing.title;
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/gallery/${req.file.filename}`;

      const result = await db.run(
        'UPDATE gallery_images SET title = ?, image_url = ? WHERE id = ?',
        [newTitle, imageUrl, req.params.id]
      );

      if (!result.changes) {
        return res.status(500).json({ error: 'Erreur mis a jour image' });
      }

      res.json({
        id: req.params.id,
        title: newTitle,
        imageUrl,
        message: 'succès'
      });
    } catch (err) {
      console.error('Replace gallery image error:', err);
      res.status(500).json({ error: 'Erreur mis a jour' });
    }
  }
);

// delete gallery image (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const existing = await db.get('SELECT image_url FROM gallery_images WHERE id = ?', req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Image pas trouve' });
    }

    await db.run('DELETE FROM gallery_images WHERE id = ?', req.params.id);

    const fileSegment = '/uploads/gallery/';
    if (existing.image_url && existing.image_url.includes(fileSegment)) {
      const fileName = existing.image_url.split(fileSegment)[1];
      const filePath = path.join(galleryUploadsDir, fileName);
      fs.unlink(filePath, () => { });
    }
    res.json({ message: 'succès' });
  } catch (err) {
    console.error('Delete gallery image error:', err);
    res.status(500).json({ error: 'Erreur delete image' });
  }
});

export default router;
