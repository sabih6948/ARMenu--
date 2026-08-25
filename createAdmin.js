import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/admin.js';

const username = 'admin';
const plainPassword = '123';

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashed = await bcrypt.hash(plainPassword, 10);
    await Admin.deleteMany({});
    await Admin.create({ username, password: hashed });
    console.log('Admin created:', username);
    process.exit();
  });