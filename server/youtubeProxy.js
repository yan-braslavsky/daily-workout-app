const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const router = express.Router();

// Enable CORS for all routes
router.use(cors());

const log = (message, color = '\x1b[0m') => {
    console.log(`${color}%s\x1b[0m`, message);
};

router.get('/youtube-search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        log('❌ Missing query parameter', '\x1b[31m'); // Red color
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+shorts`;

    try {
        log(`🔍 Searching for: ${query}`, '\x1b[34m'); // Blue color
        const response = await fetch(searchUrl);
        const html = await response.text();

        const videoIdMatch = html.match(/"videoId":"(.*?)"/);
        if (videoIdMatch) {
            const videoId = videoIdMatch[1];
            log(`✅ Video found: ${videoId}`, '\x1b[32m'); // Green color
            res.json({
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                videoUrl: `https://www.youtube.com/shorts/${videoId}`,
            });
        } else {
            log('⚠️ No video found', '\x1b[33m'); // Yellow color
            res.status(404).json({ error: 'No video found' });
        }
    } catch (error) {
        log(`❌ Error fetching YouTube search results: ${error.message}`, '\x1b[31m'); // Red color
        log(`❌ Stack trace: ${error.stack}`, '\x1b[31m'); // Red color
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
