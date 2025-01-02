import axios from 'axios';
import { logger } from '../utils/logger';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  shortsUrl: string; // Add shortsUrl to the interface
}

export async function searchExerciseVideo(exerciseName: string): Promise<YouTubeSearchResult> {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not found in environment variables');
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: `${exerciseName} exercise form #shorts`, // Add #shorts to target Short videos
        key: apiKey,
        type: 'video',
        videoDuration: 'short', // Change to short duration
        videoEmbeddable: true,
        order: 'rating', // Get highest rated content first
      },
    });

    const item = response.data.items[0];
    
    if (!item) {
      throw new Error('No video results found');
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
    logger.error('YouTube API Error:', error);
    throw new Error('Failed to fetch YouTube video');
  }
}
