import express from 'express';
import { HomepageSection } from '../models/HomepageSection.js';
import { Movie } from '../models/Movie.js';

const router = express.Router();

// Get all homepage sections with populated movies
router.get('/', async (req, res) => {
  try {
    const sections = await HomepageSection.find({ isActive: true })
      .populate('movieIds')
      .sort({ order: 1, createdAt: 1 });
    res.json(sections);
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    res.status(500).json({ message: 'Error fetching homepage sections', error: error.message });
  }
});

// Get all sections for admin (including inactive)
router.get('/admin', async (req, res) => {
  try {
    const sections = await HomepageSection.find()
      .populate('movieIds')
      .sort({ order: 1, createdAt: 1 });
    res.json(sections);
  } catch (error) {
    console.error('Error fetching admin homepage sections:', error);
    res.status(500).json({ message: 'Error fetching admin homepage sections', error: error.message });
  }
});

// Create new homepage section
router.post('/', async (req, res) => {
  try {
    console.log('Creating new homepage section...');
    console.log('Section data:', req.body);

    const { title, movieIds, order } = req.body;

    // Validate required fields
    if (!title || !movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
      return res.status(400).json({ 
        message: 'Title and at least one movie ID are required' 
      });
    }

    // Verify all movie IDs exist
    const existingMovies = await Movie.find({ _id: { $in: movieIds } });
    if (existingMovies.length !== movieIds.length) {
      return res.status(400).json({ 
        message: 'One or more movie IDs are invalid' 
      });
    }

    const section = new HomepageSection({
      title,
      movieIds,
      order: order || 0
    });

    const savedSection = await section.save();
    const populatedSection = await HomepageSection.findById(savedSection._id).populate('movieIds');
    
    console.log('Homepage section created successfully:', savedSection.title);
    res.status(201).json(populatedSection);
  } catch (error) {
    console.error('Error creating homepage section:', error);
    res.status(500).json({ message: 'Error creating homepage section', error: error.message });
  }
});

// Update homepage section
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating homepage section...');
    console.log('Section ID:', req.params.id);
    console.log('Update data:', req.body);

    const { title, movieIds, order, isActive } = req.body;

    // Validate required fields
    if (!title || !movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
      return res.status(400).json({ 
        message: 'Title and at least one movie ID are required' 
      });
    }

    // Verify all movie IDs exist
    const existingMovies = await Movie.find({ _id: { $in: movieIds } });
    if (existingMovies.length !== movieIds.length) {
      return res.status(400).json({ 
        message: 'One or more movie IDs are invalid' 
      });
    }

    const updateData = {
      title,
      movieIds,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    };

    const updatedSection = await HomepageSection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('movieIds');

    if (!updatedSection) {
      return res.status(404).json({ message: 'Homepage section not found' });
    }

    console.log('Homepage section updated successfully:', updatedSection.title);
    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating homepage section:', error);
    res.status(500).json({ message: 'Error updating homepage section', error: error.message });
  }
});

// Delete homepage section
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting homepage section...');
    console.log('Section ID:', req.params.id);

    const deletedSection = await HomepageSection.findByIdAndDelete(req.params.id);
    
    if (!deletedSection) {
      return res.status(404).json({ message: 'Homepage section not found' });
    }

    console.log('Homepage section deleted successfully:', deletedSection.title);
    res.json({ message: 'Homepage section deleted successfully' });
  } catch (error) {
    console.error('Error deleting homepage section:', error);
    res.status(500).json({ message: 'Error deleting homepage section', error: error.message });
  }
});

// Get all movies for selection dropdown
router.get('/movies/available', async (req, res) => {
  try {
    const movies = await Movie.find({})
      .select('_id title releaseYear portraitImage genre director cast')
      .sort({ title: 1 });
    console.log(`Found ${movies.length} movies in database`);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching available movies:', error);
    res.status(500).json({ message: 'Error fetching available movies', error: error.message });
  }
});

export default router;
