const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testAI() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Try multiple model strings to see which one sticks
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello, respond with 'OK'");
      const response = await result.response;
      console.log(`Model ${m} SUCCESS: ${response.text()}`);
      return;
    } catch (err) {
      console.error(`Model ${m} FAILED: ${err.message}`);
    }
  }
}

testAI();
