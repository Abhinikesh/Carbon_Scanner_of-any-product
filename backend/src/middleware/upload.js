const multer = require('multer');

// Configure in-memory storage (files stay in RAM, never written to disk)
const storage = multer.memoryStorage();

// Accept only image/jpeg, image/png, and image/webp
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      'Only JPG, PNG, or WEBP images are accepted. Convert PDFs to an image before uploading.'
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload.single('file');
