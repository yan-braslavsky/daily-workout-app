import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  shortsUrl: string; // Add shortsUrl to the interface
}

async function searchYouTubeWithProxy(exerciseName: string): Promise<YouTubeSearchResult> {
  const query = encodeURIComponent(`${exerciseName} exercise form shorts`);
  const proxyUrl = `/api/youtube-search?q=${query}`;  // Updated to use /api prefix

  try {
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      logger.warn(`No video found via proxy for "${exerciseName}"`);
      return generateFallbackResult(exerciseName);
    }

    const data = await response.json();
    return {
      videoId: data.videoId || 'not_found',
      title: data.title || `${exerciseName} (via YouTube Search)`,
      thumbnailUrl: data.thumbnail || 'https://via.placeholder.com/120x90.png?text=Search+on+YouTube',
      shortsUrl: data.videoUrl,
    };
  } catch (error) {
    logger.error(`Proxy search failed for "${exerciseName}":`, error);
    return generateFallbackResult(exerciseName);
  }
}

export async function searchExerciseVideo(exerciseName: string): Promise<YouTubeSearchResult> {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  
  logger.info('YouTube API Key exists:', !!apiKey);
  logger.info('Exercise name:', exerciseName);
  
  try {
    // First try with API
    if (apiKey) {
      try {
        const params = {
          part: 'snippet',
          maxResults: 1,
          q: `${exerciseName} exercise form #shorts`,
          key: apiKey,
          type: 'video',
          videoDuration: 'short',
          videoEmbeddable: true,
          order: 'rating',
        };

        logger.info('Making YouTube API request with params:', {
          ...params,
          key: '[REDACTED]' // Don't log the actual API key
        });

        const response = await axios.get(YOUTUBE_API_URL, { params });

        logger.info('YouTube API response status:', response.status);
        logger.info('YouTube API response data:', response.data); // Changed from debug to info

        const item = response.data.items[0];
        
        if (!item) {
          return generateFallbackResult(exerciseName);
        }

        // Construct proper Shorts URL
        const videoId = item.id.videoId;
        const shortsUrl = `https://www.youtube.com/shorts/${videoId}`;
        
        return {
          videoId,
          title: item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          shortsUrl, // Add shortsUrl to the return object
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 403) {
          logger.warn('API quota exceeded or access forbidden, falling back to proxy search');
          return await searchYouTubeWithProxy(exerciseName);
        }
        throw error; // Re-throw if it's not a 403 error
      }
    }

    // If no API key or other error, use proxy search
    return await searchYouTubeWithProxy(exerciseName);
  } catch (error) {
    logger.error('All YouTube search methods failed:', error);
    return generateFallbackResult(exerciseName);
  }
}

function generateFallbackResult(exerciseName: string): YouTubeSearchResult {
  // Generate a search URL that users can click to search manually
  const searchQuery = encodeURIComponent(`${exerciseName} exercise form shorts`);
  const shortsUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  
  return {
    videoId: 'not_found',
    title: `${exerciseName} (Search on YouTube)`,
    thumbnailUrl: 'https://via.placeholder.com/120x90.png?text=Search+on+YouTube',
    shortsUrl,
  };
}
