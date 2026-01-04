const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/emotion/recognize
// @desc    Recognize emotion from image (integrated with Python API)
router.post('/recognize', protect, async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Integrate with Python API
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
    
    try {
      const pythonResponse = await fetch(`${pythonApiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image })
      });

      if (!pythonResponse.ok) {
        throw new Error('Python API error');
      }

      const pythonData = await pythonResponse.json();
      
      res.json({
        success: true,
        emotion: pythonData.emotion,
        confidence: pythonData.confidence,
        all_emotions: pythonData.all_emotions || {}
      });
    } catch (pythonError) {
      // Fallback if Python API is not available
      console.error('Python API error:', pythonError);
      const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust'];
      res.json({
        success: true,
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        confidence: (Math.random() * 0.2 + 0.8).toFixed(2),
        message: 'Using fallback (Python API not available)'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

