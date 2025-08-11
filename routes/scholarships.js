const express = require('express');
const router = express.Router();
// Directly require the service. The server's startup logic ensures this is available.
const scholarshipService = require('../services/scholarshipService');

// Helper function to format category names for a clean display
const formatCategoryName = (name) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// GET /api/scholarships/categories
router.get('/categories', async (req, res) => {
    // The service is guaranteed to be available, so we call it directly.
    const categories = await scholarshipService.getScholarshipCategories();
    const formattedCategories = categories.map(cat => ({
        id: cat._id,
        name: formatCategoryName(cat._id),
        count: cat.count
    }));
    res.json({ categories: formattedCategories });
});

// GET /api/scholarships/deadlines
router.get('/deadlines', async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    const deadlines = await scholarshipService.getUpcomingDeadlines(days);
    res.json({ upcoming_deadlines: deadlines });
});

// POST /api/scholarships/search
router.post('/search', async (req, res) => {
    const { studentProfile, options } = req.body;
    // Add validation for required request body
    if (!studentProfile) {
        return res.status(400).json({ error: 'studentProfile is required' });
    }
    const scholarships = await scholarshipService.searchScholarships(studentProfile, options);
    res.json({ scholarships });
});

// POST /api/scholarships/recommendations
router.post('/recommendations', async (req, res) => {
    const { studentProfile } = req.body;
    if (!studentProfile) {
        return res.status(400).json({ error: 'studentProfile is required' });
    }
    const recommendations = await scholarshipService.getRecommendations(studentProfile);
    res.json({ recommendations });
});

module.exports = router;
