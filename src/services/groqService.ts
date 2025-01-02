import axios from "axios";
import { WorkoutResponse } from "../types/Exercise";
import { logger } from "../utils/logger";

export async function generateWorkouts(prompt: string, equipment: string[]): Promise<WorkoutResponse> {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;
  
  logger.log("🔑 Checking API key...");
  logger.log("API Key present:", !!apiKey);
  logger.log("API Key length:", apiKey?.length);
  
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
      const parsedData = JSON.parse(generatedContent);
      logger.log("✅ Successfully parsed JSON response");
      logger.log("🎯 Final workout data:", JSON.stringify(parsedData, null, 2));
      return parsedData as WorkoutResponse;
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