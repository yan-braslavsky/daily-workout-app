import axios from 'axios';
import { logger } from '../utils/logger';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
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
        q: `${exerciseName} exercise tutorial form`,
        key: apiKey,
        type: 'video',
        videoDuration: 'medium', // Filter for medium length videos
        videoEmbeddable: true,
      },
    });

    const item = response.data.items[0];
    
    if (!item) {
      throw new Error('No video results found');
    }

    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high.url,
    };
  } catch (error) {
    logger.error('YouTube API Error:', error);
    throw new Error('Failed to fetch YouTube video');
  }
}
