import express from 'express';
import { getDb } from '../db/db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// ============ CATEGORIES ============

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const db = getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY title');
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin only)
router.post('/categories', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Category title required' });
    }

    const db = getDb();
    const result = await db.run('INSERT INTO categories (title) VALUES (?)', title);

    res.status(201).json({ 
      id: result.lastID,
      title,
      message: 'Category created successfully'
    });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/categories/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Category title required' });
    }

    const db = getDb();
    await db.run('UPDATE categories SET title = ? WHERE id = ?', [title, req.params.id]);

    res.json({ id: req.params.id, title, message: 'Category updated successfully' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/categories/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM categories WHERE id = ?', req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============ DISHES ============

// Get all dishes (with categories)
router.get('/dishes', async (req, res) => {
  try {
    const db = getDb();
    const dishes = await db.all(`
      SELECT d.*, c.title as category_title 
      FROM dishes d 
      JOIN categories c ON d.category_id = c.id 
      ORDER BY d.category_id, d.title
    `);
    res.json(dishes);
  } catch (err) {
    console.error('Get dishes error:', err);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Get dishes by category
router.get('/dishes/category/:categoryId', async (req, res) => {
  try {
    const db = getDb();
    const dishes = await db.all(
      'SELECT * FROM dishes WHERE category_id = ? ORDER BY title',
      req.params.categoryId
    );
    res.json(dishes);
  } catch (err) {
    console.error('Get dishes by category error:', err);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Create dish (admin only)
router.post('/dishes', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { categoryId, title, description, price } = req.body;

    if (!categoryId || !title || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    const result = await db.run(
      `INSERT INTO dishes (category_id, title, description, price) 
       VALUES (?, ?, ?, ?)`,
      [categoryId, title, description || null, price]
    );

    res.status(201).json({
      id: result.lastID,
      categoryId,
      title,
      description,
      price,
      message: 'Dish created successfully'
    });
  } catch (err) {
    console.error('Create dish error:', err);
    res.status(500).json({ error: 'Failed to create dish' });
  }
});

// Update dish (admin only)
router.put('/dishes/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { categoryId, title, description, price } = req.body;

    if (!categoryId || !title || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    await db.run(
      `UPDATE dishes 
       SET category_id = ?, title = ?, description = ?, price = ? 
       WHERE id = ?`,
      [categoryId, title, description || null, price, req.params.id]
    );

    res.json({
      id: req.params.id,
      categoryId,
      title,
      description,
      price,
      message: 'Dish updated successfully'
    });
  } catch (err) {
    console.error('Update dish error:', err);
    res.status(500).json({ error: 'Failed to update dish' });
  }
});

// Delete dish (admin only)
router.delete('/dishes/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM dishes WHERE id = ?', req.params.id);
    res.json({ message: 'Dish deleted successfully' });
  } catch (err) {
    console.error('Delete dish error:', err);
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

// ============ MENUS ============

// Get all menus
router.get('/menus', async (req, res) => {
  try {
    const db = getDb();
    const menus = await db.all('SELECT * FROM menus ORDER BY title');
    res.json(menus);
  } catch (err) {
    console.error('Get menus error:', err);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// Create menu (admin only)
router.post('/menus', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    const result = await db.run(
      `INSERT INTO menus (title, description, price) 
       VALUES (?, ?, ?)`,
      [title, description, price]
    );

    res.status(201).json({
      id: result.lastID,
      title,
      description,
      price,
      message: 'Menu created successfully'
    });
  } catch (err) {
    console.error('Create menu error:', err);
    res.status(500).json({ error: 'Failed to create menu' });
  }
});

// Update menu (admin only)
router.put('/menus/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    await db.run(
      `UPDATE menus 
       SET title = ?, description = ?, price = ? 
       WHERE id = ?`,
      [title, description, price, req.params.id]
    );

    res.json({
      id: req.params.id,
      title,
      description,
      price,
      message: 'Menu updated successfully'
    });
  } catch (err) {
    console.error('Update menu error:', err);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

// Delete menu (admin only)
router.delete('/menus/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM menus WHERE id = ?', req.params.id);
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    console.error('Delete menu error:', err);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
});

export default router;
