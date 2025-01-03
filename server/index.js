const express = require('express');
const cors = require('cors');
const youtubeProxy = require('./youtubeProxy');

const app = express();
const PORT = 3001;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Mount the YouTube proxy router
app.use('/api', youtubeProxy);

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
