import axios from "axios";
import { WorkoutResponse, Exercise } from "../types/Exercise"; // Import Exercise type
import { logger } from "../utils/logger";
import { searchExerciseVideo } from './youtubeService';

async function fetchYoutubeInfo(exerciseName: string): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  try {
    const videoData = await searchExerciseVideo(exerciseName);
    return {
      videoUrl: videoData.shortsUrl, // Use the shorts-specific URL
      thumbnailUrl: videoData.thumbnailUrl
    };
  } catch (error) {
    logger.error(`Failed to fetch YouTube info for ${exerciseName}:`, error);
    // Fallback to shorts search results
    return {
      videoUrl: `https://www.youtube.com/hashtag/shorts?q=${encodeURIComponent(exerciseName)}`,
      thumbnailUrl: "https://placehold.co/200x120"
    };
  }
}

export async function generateWorkouts(prompt: string, equipment: string[]): Promise<WorkoutResponse> {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;
  
  logger.log("🔑 Checking API key...");
  logger.log("API Key present:", !!apiKey);
  logger.log("API Key length:", apiKey?.length);//minor
  
  if (!apiKey) {
    logger.error("❌ No API key found in environment variables!");
    throw new Error("REACT_APP_GROQ_API_KEY is not set in environment variables");
  }

  const schema = require('../workoutSchema.json');
  const systemPrompt = `You are a fitness expert. Generate a workout routine as JSON that strictly follows this schema: ${JSON.stringify(schema)}`;
  
  const requestPayload = {
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Create a workout routine using these equipment items: ${equipment.join(", ")}. 
                 Requirements: ${prompt}. 
                 Return ONLY valid JSON, no additional text.` 
      }
    ],
    model: "mixtral-8x7b-32768",
    temperature: 0.7,
    max_tokens: 4000
  };

  logger.log("📝 Request payload:", JSON.stringify(requestPayload, null, 2));
  logger.log("🔐 Authorization header:", `Bearer ${apiKey.substring(0, 10)}...`);

  try {
    logger.log("🚀 Sending request to Groq API...");
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      requestPayload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.log("✅ Received response from Groq API");
    logger.log("📊 Response status:", response.status);
    logger.log("📄 Raw response:", JSON.stringify(response.data, null, 2));
    
    const generatedContent = response.data.choices[0]?.message?.content || "";
    logger.log("📝 Generated content:", generatedContent);
    
    try {
      const parsedData = JSON.parse(generatedContent) as WorkoutResponse;
      logger.log("✅ Successfully parsed JSON response");
      logger.log("🎯 Final workout data:", JSON.stringify(parsedData, null, 2));
      
      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Parsed data is not an object');
      }
      if (!parsedData.exercises || !Array.isArray(parsedData.exercises)) {
        throw new Error('Parsed data does not contain an exercises array');
      }
      parsedData.exercises.forEach((exercise, index) => {
        if (!exercise.name || typeof exercise.name !== 'string') {
          throw new Error(`Exercise at index ${index} does not have a valid name`);
        }
        if (!exercise.musclesTargeted || !Array.isArray(exercise.musclesTargeted)) {
          throw new Error(`Exercise at index ${index} does not have a valid musclesTargeted array`);
        }
        if (!exercise.equipment || !Array.isArray(exercise.equipment)) {
          throw new Error(`Exercise at index ${index} does not have a valid equipment array`);
        }
        if (!exercise.description || typeof exercise.description !== 'string') {
          throw new Error(`Exercise at index ${index} does not have a valid description`);
        }
        if (!exercise.sets || typeof exercise.sets !== 'number') {
          throw new Error(`Exercise at index ${index} does not have a valid sets number`);
        }
        if (!exercise.reps || typeof exercise.reps !== 'string') {
          throw new Error(`Exercise at index ${index} does not have a valid reps string`);
        }
      });

      // Populate each exercise with YouTube info
      const updatedExercises = await Promise.all(
        parsedData.exercises.map(async (ex: Exercise) => {
          const youtubeData = await fetchYoutubeInfo(ex.name);
          return { ...ex, ...youtubeData };
        })
      );
      parsedData.exercises = updatedExercises;

      return parsedData;
    } catch (parseError) {
      logger.error("❌ Failed to parse API response as JSON:", parseError);
      logger.error("📄 Problematic content:", generatedContent);
      throw new Error("Invalid response format from API");
    }
  } catch (err: any) {
    logger.error("❌ Error calling Groq API:", err.message);
    logger.error("📄 Error details:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    });
    throw new Error(`Failed to generate workout: ${err.message}`);
  }
}