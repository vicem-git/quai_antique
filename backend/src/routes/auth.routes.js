import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../db/db.js';
import { verifyToken, generateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// test endpoint to '/' 
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // validate
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();

    // check existing email 
    const existing = await db.get('SELECT id FROM accounts WHERE email = ?', email);
    if (existing) {
      return res.status(409).json({ error: 'email exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO accounts (email, password_hash, access_level)
       VALUES (?, ?, ?)`, [email, passwordHash, 'user']
    );

    // create user
    await db.run(
      `INSERT INTO users (account_id, first_name, last_name, default_guests, allergies)
     VALUES (?, ?, ?, ?, ?)`, [result.lastID, firstName, lastName, 2, 'None']
    );

    const account = await db.get('SELECT id, email, access_level FROM accounts WHERE id = ?', result.lastID);
    const token = generateToken(account);

    res.status(201).json({
      message: 'utilisateur créé avec succès',
      token,
      user: {
        id: account.id,
        email: account.email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email et mot de passe requis' });
    }

    const db = getDb();
    const account = await db.get('SELECT * FROM accounts WHERE email = ?', email);

    if (!account) {
      return res.status(401).json({ error: 'mot de passe ou email invalide' });
    }

    const validPassword = await bcrypt.compare(password, account.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'mot de passe ou email invalide' });
    }

    const token = generateToken(account);

    // Get user details if not admin
    let userData = { id: account.id, email: account.email };
    if (account.access_level === 'user') {
      const user = await db.get('SELECT * FROM users WHERE account_id = ?', account.id);
      userData = {
        ...userData,
        firstName: user.first_name,
        lastName: user.last_name,
        defaultGuests: user.default_guests,
        allergies: user.allergies
      };
    }

    res.json({
      message: 'connexion réussie',
      token,
      user: userData,
      accessLevel: account.access_level
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'connexion échoué' });
  }
});

// get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const account = await db.get('SELECT * FROM accounts WHERE id = ?', req.user.id);

    let userData = { id: account.id, email: account.email, accessLevel: account.access_level };

    if (account.access_level === 'user') {
      const user = await db.get('SELECT * FROM users WHERE account_id = ?', account.id);
      userData = {
        ...userData,
        firstName: user.first_name,
        lastName: user.last_name,
        defaultGuests: user.default_guests,
        allergies: user.allergies
      };
    }

    res.json(userData);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'erreur lors de la recuperation utilisateur' });
  }
});

// update user profile (clients only)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.access_level !== 'user') {
      return res.status(403).json({ error: 'Seuls les utilisateurs peuvent mettre à jour leur profil.' });
    }

    const { firstName, lastName, defaultGuests, allergies } = req.body;
    const db = getDb();

    await db.run(
      `UPDATE users 
       SET first_name = ?, last_name = ?, default_guests = ?, allergies = ?
       WHERE account_id = ?`,
      [firstName, lastName, defaultGuests, allergies, req.user.id]
    );

    res.json({ message: 'Profile mis a jour' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erreur lors de la mis a jour du profil' });
  }
});

// delete account
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const db = getDb();

    // Delete user profile if exists
    await db.run('DELETE FROM users WHERE account_id = ?', req.user.id);

    // Delete account
    await db.run('DELETE FROM accounts WHERE id = ?', req.user.id);

    res.json({ message: 'compte elimine avec succès' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Elimination de compte échoué' });
  }
});

export default router;

