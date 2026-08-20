import mongoose from 'mongoose';
import Service from './server/src/models/Service.js';
import Package from './server/src/models/Package.js';
import IndustryBundle from './server/src/models/IndustryBundle.js';

const uri = 'mongodb+srv://stackfoxtech_db_user:WnFxoHe4033lY6kO@cluster0.4ct9dpc.mongodb.net/';

async function check() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to:', mongoose.connection.name);
    
    const sCount = await Service.countDocuments();
    const pCount = await Package.countDocuments();
    const bCount = await IndustryBundle.countDocuments();
    
    console.log('Services:', sCount);
    console.log('Packages:', pCount);
    console.log('Bundles:', bCount);
    
    if (bCount > 0) {
      const b = await IndustryBundle.findOne({ dataId: 'ind-realestate' });
      console.log('Found ind-realestate:', b ? 'YES' : 'NO');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

check();
