import mongoose from 'mongoose';
import { BlogPost } from './server/src/models/Misc.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await BlogPost.countDocuments();
  const posts = await BlogPost.find();
  console.log('Total posts:', count);
  console.log('Posts:', JSON.stringify(posts, null, 2));
  process.exit();
}
check();
