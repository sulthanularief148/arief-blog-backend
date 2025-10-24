import pool from '../config/db.js';
import { hashPassword, verifyPassword, generateToken, logSecurityEvent } from '../utils/security.js';

// Register user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role = 'viewer' } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, passwordHash, role]
    );

    await logSecurityEvent('USER_REGISTERED', result.insertId, req.ip, req.get('User-Agent'),
      { username, email, role }, 'low');

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user
    const [users] = await pool.query(
      "SELECT id, username, email, password_hash, role, failed_attempts, locked_until FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (users.length === 0) {
      await logSecurityEvent('LOGIN_FAILED', null, req.ip, req.get('User-Agent'),
        { username, reason: 'user_not_found' }, 'medium');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      await logSecurityEvent('LOGIN_ATTEMPT_LOCKED_ACCOUNT', user.id, req.ip, req.get('User-Agent'),
        { locked_until: user.locked_until }, 'high');
      return res.status(423).json({ error: 'Account is temporarily locked' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = user.failed_attempts + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes

      await pool.query(
        "UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?",
        [failedAttempts, lockUntil, user.id]
      );

      await logSecurityEvent('LOGIN_FAILED', user.id, req.ip, req.get('User-Agent'),
        { username, failed_attempts: failedAttempts, locked: !!lockUntil }, 'high');

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await pool.query(
      "UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?",
      [user.id]
    );

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    await logSecurityEvent('LOGIN_SUCCESS', user.id, req.ip, req.get('User-Agent'),
      { username }, 'low');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};