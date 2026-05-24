require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const existingAdmin = await User.findOne({ email: 'admin@skillsync.test' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@skillsync.test',
      password: 'adminpassword',
      role: 'admin',
    });

    console.log('Admin seeded successfully:', adminUser.email);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
};

seedAdmin();
