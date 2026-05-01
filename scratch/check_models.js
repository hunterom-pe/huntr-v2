const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    models.models.forEach(m => {
      console.log(`- ${m.name}`);
    });
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

listModels();
