import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin)
        return res.status(401).json({
        error: 'Invalid credentials'
     });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
        return res.status(401).json({
        error: 'Invalid credentials'
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({
        error: err.message
    });
  }
};