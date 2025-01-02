const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const colors = require("colors");

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

// Path to the workout schema file
const workoutSchemaPath = path.join(__dirname, "workoutSchema.json");

// Function to load the workout schema from workoutSchema.json
function getWorkoutSchema() {
  if (!fs.existsSync(workoutSchemaPath)) {
    throw new Error(`File not found: ${workoutSchemaPath}`);
  }
  return fs.readFileSync(workoutSchemaPath, "utf8");
}

// Function to get the Groq API key from Firestore
async function getGroqApiKey() {
  const configDoc = await db.collection("config").doc("llm").get();
  if (!configDoc.exists) {
    throw new Error("🚨 No API key found in Firestore under config/llm");
  }
  const apiKey = configDoc.data().groq_api_key;
  if (!apiKey) {
    throw new Error("🔑 GROQ_API_KEY is missing in Firestore config/llm");
  }
  return apiKey;
}

// Function to create the Groq API prompt
function createPrompt(message, schema) {
  return `Please extract and return the following message as valid JSON data, strictly conforming to this JSON schema: ${schema}. 
          Ensure no additional text, code block markers, whitespaces, or illegal characters are included. 
          Return only the valid JSON as plain text. Message: ${message}.
          
          Additional considerations:
          - If multiple exercises are mentioned in a single sentence (e.g., "Lean into Crow, complete 10 repetitions, followed by Crow, hold for 10 seconds"), split them into separate exercises.
          - Ensure that each exercise has its own entry with its respective name, reps, duration, and video URL.
          - When an exercise says "One partner rests/ assists", it is not an exercise, skip it and don't include it in the JSON.
          - Look into schema description fields to understand better how to extract the data.
          `;
}

// Function to clean and extract JSON from the raw Groq response
function cleanGroqResponse(rawResponse) {
  // Remove code block markers (```) or any leading/trailing whitespace
  const cleanedResponse = rawResponse.replace(/```/g, "").trim();

  // Find the start and end of the JSON structure
  const jsonStart = cleanedResponse.indexOf("{");
  const jsonEnd = cleanedResponse.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No valid JSON structure found in Groq API response.");
  }

  // Extract the JSON string
  return cleanedResponse.substring(jsonStart, jsonEnd + 1);
}

// Function to send the message to Groq API via SDK and extract data into JSON
async function sendMessageToGroq(message, schema, groqApiKey) {
  const groq = new Groq({ apiKey: groqApiKey });

  // Use the extracted prompt creation function
  const prompt = createPrompt(message, schema);

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
    });

    const rawResponse = response.choices[0]?.message?.content || "";
    logger.info(colors.yellow("📄 Raw response from Groq API: ") + rawResponse);

    // Use the extracted cleaning function
    const jsonString = cleanGroqResponse(rawResponse);

    // Parse the cleaned-up JSON string
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (jsonError) {
      logger.error(colors.red(`❌ Error parsing extracted JSON: ${jsonError.message}`));
      throw new Error(`Invalid JSON format: ${jsonError.message}`);
    }

    // Further validation to ensure it's a valid JSON object or array
    if (typeof parsedData !== "object") {
      throw new Error("Parsed data is not a valid JSON object.");
    }

    return parsedData;
  } catch (error) {
    logger.error(colors.red("❌ Error sending message to Groq API:"), error);
    throw new Error("Failed to generate JSON from Groq API.");
  }
}

// Cloud function to convert filtered messages into structured workout JSON
exports.messageToJsonConverter = onDocumentCreated("filteredMessages/{messageId}", async (event) => {
  const messageData = event.data.data();
  const messageContent = messageData.message || "";

  logger.info(colors.blue(`🚀 Received new filtered message with ID: ${colors.green(event.params.messageId)}`));

  // Load workout schema
  let workoutSchema;
  try {
    workoutSchema = getWorkoutSchema();
    logger.info(colors.green("✅ Workout schema loaded successfully."));
  } catch (error) {
    logger.error(colors.red(`❌ Failed to load workout schema: ${error.message}`));
    return;
  }

  // Get Groq API key from Firestore
  let groqApiKey;
  try {
    groqApiKey = await getGroqApiKey();
    logger.info(colors.green("🔑 Groq API key loaded successfully."));
  } catch (error) {
    logger.error(colors.red(`❌ Failed to load Groq API key: ${error.message}`));
    return;
  }

  // Send the message to Groq API for JSON extraction
  let extractedData;
  try {
    logger.info(colors.blue("📝 Sending message to Groq API for JSON extraction..."));
    extractedData = await sendMessageToGroq(messageContent, workoutSchema, groqApiKey);
    logger.info(colors.green("✅ JSON extracted successfully from the message."));
  } catch (error) {
    logger.error(colors.red(`❌ JSON extraction failed: ${error.message}`));
    return;
  }

  // Validate extracted data before storing in Firestore
  if (typeof extractedData !== "object" || Array.isArray(extractedData)) {
    logger.error(colors.red("❌ Extracted data is not a valid JSON object."));
    return;
  }

  // Store the extracted JSON data in Firestore under a new collection
  const convertedWorkoutRef = db.collection("convertedWorkouts").doc(event.params.messageId);
  try {
    await convertedWorkoutRef.set(extractedData);
    logger.info(colors.green(`💾 Extracted JSON saved to Firestore with ID: ${event.params.messageId}`));
  } catch (error) {
    logger.error(colors.red(`❌ Failed to save extracted JSON to Firestore: ${error.message}`));
  }
});
