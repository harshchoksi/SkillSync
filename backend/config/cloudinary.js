// config/cloudinary.js - Cloudinary setup for image uploads
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillsync/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// Storage for service images
const serviceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillsync/services',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill' }],
  },
});

// Multer upload instances
const uploadProfile = multer({ storage: profileStorage });
const uploadService = multer({ storage: serviceStorage });

module.exports = { cloudinary, uploadProfile, uploadService };
