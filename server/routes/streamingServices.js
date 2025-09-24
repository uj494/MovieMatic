import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { StreamingService } from '../models/StreamingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for icon uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/icons');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'icon-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

const router = express.Router();

// Get all streaming services
router.get('/', async (req, res) => {
  try {
    const services = await StreamingService.find({ isActive: true }).sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching streaming services:', error);
    res.status(500).json({ message: 'Error fetching streaming services', error: error.message });
  }
});

// Get all streaming services (including inactive) - for admin
router.get('/admin', async (req, res) => {
  try {
    const services = await StreamingService.find().sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching all streaming services:', error);
    res.status(500).json({ message: 'Error fetching streaming services', error: error.message });
  }
});

// Get single streaming service
router.get('/:id', async (req, res) => {
  try {
    const service = await StreamingService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Streaming service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching streaming service:', error);
    res.status(500).json({ message: 'Error fetching streaming service', error: error.message });
  }
});

// Create new streaming service
router.post('/', upload.single('icon'), handleMulterError, async (req, res) => {
  try {
    console.log('Creating streaming service...');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { name, baseUrl, isActive } = req.body;
    
    if (!name || !baseUrl) {
      return res.status(400).json({ message: 'Name and baseUrl are required' });
    }
    
    // Check if service already exists
    const existingService = await StreamingService.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingService) {
      return res.status(400).json({ message: 'Streaming service with this name already exists' });
    }

    const serviceData = {
      name,
      baseUrl,
      isActive: isActive === 'true' || isActive === true
    };

    // Add icon path if uploaded
    if (req.file) {
      serviceData.icon = `/uploads/icons/${req.file.filename}`;
      console.log('Icon uploaded:', serviceData.icon);
    }

    const service = new StreamingService(serviceData);
    const savedService = await service.save();
    console.log('Service created successfully:', savedService);
    res.status(201).json(savedService);
  } catch (error) {
    console.error('Error creating streaming service:', error);
    res.status(500).json({ message: 'Error creating streaming service', error: error.message });
  }
});

// Update streaming service
router.put('/:id', upload.single('icon'), handleMulterError, async (req, res) => {
  try {
    const { name, baseUrl, isActive } = req.body;
    
    const service = await StreamingService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Streaming service not found' });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== service.name) {
      const existingService = await StreamingService.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingService) {
        return res.status(400).json({ message: 'Streaming service with this name already exists' });
      }
    }

    const updateData = {
      name,
      baseUrl,
      isActive: isActive === 'true' || isActive === true
    };

    // Add icon path if new icon uploaded
    if (req.file) {
      updateData.icon = `/uploads/icons/${req.file.filename}`;
    }

    const updatedService = await StreamingService.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedService);
  } catch (error) {
    console.error('Error updating streaming service:', error);
    res.status(500).json({ message: 'Error updating streaming service', error: error.message });
  }
});

// Delete streaming service
router.delete('/:id', async (req, res) => {
  try {
    const service = await StreamingService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Streaming service not found' });
    }

    await StreamingService.findByIdAndDelete(req.params.id);
    res.json({ message: 'Streaming service deleted successfully' });
  } catch (error) {
    console.error('Error deleting streaming service:', error);
    res.status(500).json({ message: 'Error deleting streaming service', error: error.message });
  }
});

export default router;
